
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge_entries table
CREATE TABLE public.knowledge_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ux', 'visual', 'accessibility', 'conversion', 'brand')),
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competitor_patterns table
CREATE TABLE public.competitor_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('layout', 'navigation', 'color', 'typography', 'interaction')),
  embedding vector(1536),
  examples JSONB DEFAULT '[]',
  effectiveness_score NUMERIC(3,2) DEFAULT 0.0 CHECK (effectiveness_score >= 0.0 AND effectiveness_score <= 1.0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for vector similarity search
CREATE INDEX knowledge_entries_embedding_idx ON public.knowledge_entries 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX competitor_patterns_embedding_idx ON public.competitor_patterns 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create additional indexes for filtering
CREATE INDEX knowledge_entries_category_idx ON public.knowledge_entries (category);
CREATE INDEX knowledge_entries_tags_idx ON public.knowledge_entries USING GIN (tags);
CREATE INDEX competitor_patterns_industry_idx ON public.competitor_patterns (industry);
CREATE INDEX competitor_patterns_type_idx ON public.competitor_patterns (pattern_type);

-- Create RPC function for knowledge similarity search
CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  tags text[],
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    knowledge_entries.id,
    knowledge_entries.title,
    knowledge_entries.content,
    knowledge_entries.category,
    knowledge_entries.tags,
    knowledge_entries.metadata,
    1 - (knowledge_entries.embedding <=> query_embedding) as similarity
  FROM knowledge_entries
  WHERE 
    (filter_category IS NULL OR knowledge_entries.category = filter_category)
    AND 1 - (knowledge_entries.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_entries.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create RPC function for competitor pattern similarity search
CREATE OR REPLACE FUNCTION public.match_patterns(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_industry text DEFAULT NULL,
  filter_pattern_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  pattern_name text,
  description text,
  industry text,
  pattern_type text,
  examples jsonb,
  effectiveness_score numeric,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    competitor_patterns.id,
    competitor_patterns.pattern_name,
    competitor_patterns.description,
    competitor_patterns.industry,
    competitor_patterns.pattern_type,
    competitor_patterns.examples,
    competitor_patterns.effectiveness_score,
    1 - (competitor_patterns.embedding <=> query_embedding) as similarity
  FROM competitor_patterns
  WHERE 
    (filter_industry IS NULL OR competitor_patterns.industry = filter_industry)
    AND (filter_pattern_type IS NULL OR competitor_patterns.pattern_type = filter_pattern_type)
    AND 1 - (competitor_patterns.embedding <=> query_embedding) > match_threshold
  ORDER BY competitor_patterns.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Enable Row Level Security (optional - can be added later based on requirements)
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_patterns ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now (can be refined later)
CREATE POLICY "Allow all operations on knowledge_entries" ON public.knowledge_entries
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on competitor_patterns" ON public.competitor_patterns
FOR ALL USING (true) WITH CHECK (true);
