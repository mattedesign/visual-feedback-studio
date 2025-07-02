-- Update default AI model to Claude 4.0 Opus for new analysis results
ALTER TABLE public.analysis_results 
ALTER COLUMN ai_model_used SET DEFAULT 'claude-opus-4-20250514';

-- Update existing records that are using the old default to the new Claude 4.0
UPDATE public.analysis_results 
SET ai_model_used = 'claude-opus-4-20250514'
WHERE ai_model_used = 'claude-3-5-sonnet';

-- Add comment documenting the Claude 4.0 upgrade
COMMENT ON COLUMN public.analysis_results.ai_model_used IS 'AI model used for analysis - defaults to Claude 4.0 Opus for best results';