
-- Create table for prototype generation metrics
CREATE TABLE public.figmant_prototype_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  analysis_id UUID REFERENCES public.figmant_analysis_results(id),
  solution_type TEXT,
  prototype_id UUID,
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.figmant_prototype_metrics ENABLE ROW LEVEL SECURITY;

-- Users can view metrics for their own analyses
CREATE POLICY "Users can view their own prototype metrics" 
  ON public.figmant_prototype_metrics 
  FOR SELECT 
  USING (
    analysis_id IN (
      SELECT id FROM public.figmant_analysis_results 
      WHERE user_id = auth.uid()
    )
  );

-- Service role can manage all metrics (for the monitoring system)
CREATE POLICY "Service role can manage prototype metrics" 
  ON public.figmant_prototype_metrics 
  FOR ALL 
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_figmant_prototype_metrics_analysis_id ON public.figmant_prototype_metrics(analysis_id);
CREATE INDEX idx_figmant_prototype_metrics_event_type ON public.figmant_prototype_metrics(event_type);
CREATE INDEX idx_figmant_prototype_metrics_created_at ON public.figmant_prototype_metrics(created_at);
CREATE INDEX idx_figmant_prototype_metrics_solution_type ON public.figmant_prototype_metrics(solution_type);
