-- Emergency database cleanup and optimization
-- Clean up stuck analyses older than 1 hour
UPDATE public.analyses 
SET 
  status = 'failed',
  failure_reason = 'Stuck analysis cleaned up during emergency stabilization',
  updated_at = now()
WHERE 
  status IN ('pending', 'analyzing') 
  AND created_at < now() - interval '1 hour';

-- Add critical indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analyses_status_user_created 
ON public.analyses(user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analysis_results_analysis_user 
ON public.analysis_results(analysis_id, user_id);

-- Emergency analysis timeout function
CREATE OR REPLACE FUNCTION public.emergency_cleanup_stuck_analyses()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleanup_count integer;
BEGIN
  -- Clean up analyses stuck for more than 10 minutes
  UPDATE public.analyses 
  SET 
    status = 'failed',
    failure_reason = 'Emergency timeout - analysis took too long',
    updated_at = now()
  WHERE 
    status IN ('pending', 'analyzing') 
    AND created_at < now() - interval '10 minutes';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  -- Log the cleanup
  RAISE LOG 'Emergency cleanup completed: % analyses cleaned up', cleanup_count;
  
  RETURN cleanup_count;
END;
$$;

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
('total_analyses_count', (SELECT COUNT(*) FROM public.analyses), '{"source": "emergency_stabilization"}');

-- Add emergency rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  requests_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for rate limits
CREATE POLICY "Users can view their own rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_limit_per_minute integer DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_window timestamp with time zone;
  current_count integer;
BEGIN
  -- Calculate current minute window
  current_window := date_trunc('minute', now());
  
  -- Get current count for this user/endpoint/window
  SELECT requests_count INTO current_count
  FROM public.rate_limits
  WHERE user_id = p_user_id 
    AND endpoint = p_endpoint 
    AND window_start = current_window;
  
  -- If no record exists, create one
  IF current_count IS NULL THEN
    INSERT INTO public.rate_limits (user_id, endpoint, requests_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, current_window)
    ON CONFLICT (user_id, endpoint, window_start) 
    DO UPDATE SET requests_count = rate_limits.requests_count + 1;
    RETURN true;
  END IF;
  
  -- Check if under limit
  IF current_count < p_limit_per_minute THEN
    -- Increment counter
    UPDATE public.rate_limits 
    SET requests_count = requests_count + 1
    WHERE user_id = p_user_id 
      AND endpoint = p_endpoint 
      AND window_start = current_window;
    RETURN true;
  ELSE
    -- Over limit
    RETURN false;
  END IF;
END;
$$;

-- Create cleanup job for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < now() - interval '1 hour';
END;
$$;