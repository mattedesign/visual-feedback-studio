-- Add the enhanced_context column to store mentor analysis data
ALTER TABLE public.figmant_analysis_results 
ADD COLUMN enhanced_context JSONB;