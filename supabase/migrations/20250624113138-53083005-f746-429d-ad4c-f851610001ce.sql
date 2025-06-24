
-- First, drop the existing function that has a different return type
DROP FUNCTION IF EXISTS public.match_knowledge(vector, double precision, integer, text);

-- Add missing columns to knowledge_entries table to match the RPC function signature
ALTER TABLE public.knowledge_entries 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS element_type TEXT,
ADD COLUMN IF NOT EXISTS freshness_score FLOAT DEFAULT 0.0;

-- Update the category check constraint to include all the types from the TypeScript interface
ALTER TABLE public.knowledge_entries 
DROP CONSTRAINT IF EXISTS knowledge_entries_category_check;

ALTER TABLE public.knowledge_entries 
ADD CONSTRAINT knowledge_entries_category_check 
CHECK (category IN ('ux', 'visual', 'accessibility', 'conversion', 'brand', 'ecommerce-patterns', 'ux-research', 'ux-patterns', 'saas-patterns', 'fintech-patterns'));

-- Update the competitor_patterns pattern_type check constraint to include all types
ALTER TABLE public.competitor_patterns 
DROP CONSTRAINT IF EXISTS competitor_patterns_pattern_type_check;

ALTER TABLE public.competitor_patterns 
ADD CONSTRAINT competitor_patterns_pattern_type_check 
CHECK (pattern_type IN ('layout', 'navigation', 'color', 'typography', 'interaction', 'conversion', 'form', 'checkout'));

-- Create the RPC function for knowledge similarity search with the correct return type
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

-- Ensure vector indexes exist for performance
CREATE INDEX IF NOT EXISTS knowledge_entries_embedding_idx 
ON public.knowledge_entries USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS competitor_patterns_embedding_idx 
ON public.competitor_patterns USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create additional indexes for filtering
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON public.knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_industry ON public.knowledge_entries(industry);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON public.knowledge_entries USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_competitor_patterns_industry ON public.competitor_patterns(industry);
CREATE INDEX IF NOT EXISTS idx_competitor_patterns_type ON public.competitor_patterns(pattern_type);
