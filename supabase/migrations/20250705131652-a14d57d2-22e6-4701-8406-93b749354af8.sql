-- Add rate limiting and emergency monitoring infrastructure
-- Create emergency monitoring table
CREATE TABLE IF NOT EXISTS public.emergency_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on emergency metrics
ALTER TABLE public.emergency_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for emergency metrics (admin only)
CREATE POLICY "Super admins can manage emergency metrics" 
ON public.emergency_metrics 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND super_admin = true
  )
);

-- Insert initial emergency metrics
INSERT INTO public.emergency_metrics (metric_name, metric_value, metadata) VALUES
('failed_analyses_count', (SELECT COUNT(*) FROM public.analyses WHERE status = 'failed'), '{"source": "emergency_stabilization"}'),
('pending_analyses_count', (SELECT COUNT(*) FROM public.analyses WHERE status = 'pending'), '{"source": "emergency_stabilization"}'),
('total_analyses_count', (SELECT COUNT(*) FROM public.analyses), '{"source": "emergency_stabilization"}')
ON CONFLICT DO NOTHING;