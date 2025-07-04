-- Clean up stuck analyses and add analysis management
UPDATE public.analyses 
SET status = 'failed', updated_at = now()
WHERE status = 'pending' AND created_at < now() - interval '30 minutes';

-- Add analysis timeout and cancellation columns
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS timeout_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS failure_reason text,
ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at timestamp with time zone;

-- Update analysis results for better tracking
ALTER TABLE public.analysis_results
ADD COLUMN IF NOT EXISTS timeout_occurred boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cancelled_by_user boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS error_details jsonb DEFAULT '{}';

-- Create function to reset stuck analyses
CREATE OR REPLACE FUNCTION public.reset_stuck_analyses()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reset_count integer;
BEGIN
  UPDATE public.analyses 
  SET 
    status = 'failed',
    failure_reason = 'Analysis timed out - automatically reset',
    updated_at = now()
  WHERE 
    status IN ('pending', 'analyzing') 
    AND created_at < now() - interval '30 minutes';
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  
  RETURN reset_count;
END;
$$;

-- Create function to cancel analysis
CREATE OR REPLACE FUNCTION public.cancel_analysis(analysis_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.analyses 
  SET 
    status = 'cancelled',
    cancelled_at = now(),
    updated_at = now()
  WHERE 
    id = analysis_id 
    AND user_id = cancel_analysis.user_id
    AND status IN ('pending', 'analyzing');
  
  RETURN FOUND;
END;
$$;

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_analyses_status_created 
ON public.analyses(status, created_at) 
WHERE status IN ('pending', 'analyzing', 'failed');

-- Create analysis health monitoring view
CREATE OR REPLACE VIEW public.analysis_health AS
SELECT 
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (COALESCE(analysis_completed_at, now()) - created_at))) as avg_duration_seconds,
  MAX(created_at) as latest_created,
  COUNT(*) FILTER (WHERE created_at > now() - interval '1 hour') as last_hour_count
FROM public.analyses
GROUP BY status;