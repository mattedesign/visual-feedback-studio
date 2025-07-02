-- Enhanced database schema for multi-stage analysis pipeline
-- Add comprehensive analysis tracking and multi-stage results

-- Extend analysis_results with multi-stage pipeline data
ALTER TABLE public.analysis_results 
ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'single_stage',
ADD COLUMN IF NOT EXISTS google_vision_data jsonb DEFAULT null,
ADD COLUMN IF NOT EXISTS visual_intelligence jsonb DEFAULT null,
ADD COLUMN IF NOT EXISTS enhanced_prompt_data jsonb DEFAULT null,
ADD COLUMN IF NOT EXISTS synthesis_metadata jsonb DEFAULT null,
ADD COLUMN IF NOT EXISTS quality_scores jsonb DEFAULT null,
ADD COLUMN IF NOT EXISTS processing_stages jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS stage_timing jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS confidence_weights jsonb DEFAULT null,
ADD COLUMN IF NOT EXISTS validation_status text DEFAULT 'pending';

-- Add indexes for efficient multi-stage queries
CREATE INDEX IF NOT EXISTS idx_analysis_results_pipeline_stage 
ON public.analysis_results (pipeline_stage);

CREATE INDEX IF NOT EXISTS idx_analysis_results_validation_status 
ON public.analysis_results (validation_status);

CREATE INDEX IF NOT EXISTS idx_analysis_results_stage_timing 
ON public.analysis_results USING GIN (stage_timing);

-- Create analysis_stage_logs table for detailed pipeline tracking
CREATE TABLE IF NOT EXISTS public.analysis_stage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_result_id uuid NOT NULL REFERENCES public.analysis_results(id),
  stage_name text NOT NULL,
  stage_status text NOT NULL DEFAULT 'pending',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone DEFAULT null,
  duration_ms bigint DEFAULT null,
  input_data jsonb DEFAULT '{}',
  output_data jsonb DEFAULT '{}',
  error_data jsonb DEFAULT null,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on analysis_stage_logs
ALTER TABLE public.analysis_stage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for analysis_stage_logs
CREATE POLICY "Users can view their own stage logs" 
ON public.analysis_stage_logs 
FOR SELECT 
USING (
  analysis_result_id IN (
    SELECT id FROM public.analysis_results 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all stage logs" 
ON public.analysis_stage_logs 
FOR ALL 
USING (true);

-- Create pipeline_configurations table for dynamic pipeline settings
CREATE TABLE IF NOT EXISTS public.pipeline_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  stages jsonb NOT NULL DEFAULT '[]',
  weights jsonb NOT NULL DEFAULT '{}',
  thresholds jsonb NOT NULL DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on pipeline_configurations
ALTER TABLE public.pipeline_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policy for pipeline_configurations (read-only for all authenticated users)
CREATE POLICY "All authenticated users can read pipeline configurations" 
ON public.pipeline_configurations 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage pipeline configurations" 
ON public.pipeline_configurations 
FOR ALL 
USING (true);

-- Insert default multi-stage pipeline configuration
INSERT INTO public.pipeline_configurations (name, description, stages, weights, thresholds) VALUES 
('comprehensive_analysis', 
 'Multi-stage analysis with Google Vision, Claude/OpenAI, and Perplexity validation',
 '[
   {
     "name": "google_vision",
     "enabled": true,
     "timeout_ms": 30000,
     "retry_count": 2
   },
   {
     "name": "enhanced_ai_analysis", 
     "enabled": true,
     "timeout_ms": 60000,
     "retry_count": 3
   },
   {
     "name": "perplexity_validation",
     "enabled": true,
     "timeout_ms": 45000,
     "retry_count": 2
   },
   {
     "name": "intelligent_synthesis",
     "enabled": true,
     "timeout_ms": 30000,
     "retry_count": 1
   }
 ]'::jsonb,
 '{
   "google_vision": 0.15,
   "ai_analysis": 0.50, 
   "perplexity_validation": 0.25,
   "synthesis_quality": 0.10
 }'::jsonb,
 '{
   "min_confidence": 0.7,
   "min_annotations": 12,
   "max_annotations": 25,
   "quality_threshold": 0.8
 }'::jsonb
) ON CONFLICT (name) DO UPDATE SET
  stages = EXCLUDED.stages,
  weights = EXCLUDED.weights,
  thresholds = EXCLUDED.thresholds,
  updated_at = now();

-- Create function to update analysis stage timing
CREATE OR REPLACE FUNCTION public.update_analysis_stage_timing()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Calculate duration if completed
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stage timing updates
CREATE TRIGGER update_analysis_stage_logs_timing
  BEFORE UPDATE ON public.analysis_stage_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_analysis_stage_timing();