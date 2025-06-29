
-- Fix the function overloading issue by dropping the conflicting function
DROP FUNCTION IF EXISTS public.match_knowledge(vector, double precision, integer, text, text, text, text[], text);

-- Ensure we have the correct match_knowledge function
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
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
    knowledge_entries.created_at,
    knowledge_entries.updated_at,
    1 - (knowledge_entries.embedding <=> query_embedding) as similarity
  FROM knowledge_entries
  WHERE 
    (filter_category IS NULL OR knowledge_entries.category = filter_category)
    AND 1 - (knowledge_entries.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_entries.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create the missing match_patterns function
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

-- Ensure vector indexes exist for performance
CREATE INDEX IF NOT EXISTS knowledge_entries_embedding_idx 
ON public.knowledge_entries USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS competitor_patterns_embedding_idx 
ON public.competitor_patterns USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
