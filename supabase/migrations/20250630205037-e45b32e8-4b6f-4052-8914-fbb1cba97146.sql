
-- Create table to store analysis results with enhanced data
CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Core analysis data
  annotations JSONB NOT NULL DEFAULT '[]'::jsonb,
  images TEXT[] NOT NULL DEFAULT '{}',
  analysis_context TEXT,
  
  -- Enhanced context data
  enhanced_context JSONB,
  well_done_data JSONB,
  research_citations TEXT[] DEFAULT '{}',
  knowledge_sources_used INTEGER DEFAULT 0,
  
  -- Analysis metadata
  ai_model_used TEXT DEFAULT 'claude-3-5-sonnet',
  processing_time_ms INTEGER,
  total_annotations INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for analysis results
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analysis results
CREATE POLICY "Users can view their own analysis results" 
  ON public.analysis_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only insert their own analysis results
CREATE POLICY "Users can create their own analysis results" 
  ON public.analysis_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own analysis results
CREATE POLICY "Users can update their own analysis results" 
  ON public.analysis_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can only delete their own analysis results
CREATE POLICY "Users can delete their own analysis results" 
  ON public.analysis_results 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_analysis_results_user_id ON public.analysis_results(user_id);
CREATE INDEX idx_analysis_results_analysis_id ON public.analysis_results(analysis_id);
CREATE INDEX idx_analysis_results_created_at ON public.analysis_results(created_at DESC);

-- Update analyses table status when results are saved
CREATE OR REPLACE FUNCTION public.update_analysis_status_on_results()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the parent analysis status to completed
  UPDATE public.analyses 
  SET 
    status = 'completed',
    analysis_completed_at = now(),
    updated_at = now()
  WHERE id = NEW.analysis_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update analysis status
CREATE TRIGGER trigger_update_analysis_status
  AFTER INSERT ON public.analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_analysis_status_on_results();
