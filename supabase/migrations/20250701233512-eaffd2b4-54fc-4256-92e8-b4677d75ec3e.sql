-- Add optional Perplexity.ai integration columns to existing tables
-- These are all optional to maintain backward compatibility

-- Extend analysis_results table with Perplexity data
ALTER TABLE public.analysis_results 
ADD COLUMN perplexity_enhanced boolean DEFAULT false,
ADD COLUMN perplexity_research_data jsonb DEFAULT null,
ADD COLUMN perplexity_competitive_data jsonb DEFAULT null,
ADD COLUMN perplexity_trend_data jsonb DEFAULT null;

-- Extend knowledge_entries table with Perplexity validation
ALTER TABLE public.knowledge_entries
ADD COLUMN perplexity_validated boolean DEFAULT false,
ADD COLUMN perplexity_validation_score numeric DEFAULT null,
ADD COLUMN perplexity_last_validated timestamp with time zone DEFAULT null,
ADD COLUMN perplexity_sources jsonb DEFAULT null;

-- Create index for efficient Perplexity queries
CREATE INDEX IF NOT EXISTS idx_analysis_results_perplexity_enhanced 
ON public.analysis_results (perplexity_enhanced) 
WHERE perplexity_enhanced = true;

CREATE INDEX IF NOT EXISTS idx_knowledge_entries_perplexity_validated 
ON public.knowledge_entries (perplexity_validated, perplexity_last_validated) 
WHERE perplexity_validated = true;