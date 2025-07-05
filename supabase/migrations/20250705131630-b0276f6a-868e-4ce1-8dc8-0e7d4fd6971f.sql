-- Emergency database cleanup and optimization (Fixed version)
-- Clean up stuck analyses older than 1 hour
UPDATE public.analyses 
SET 
  status = 'failed',
  failure_reason = 'Stuck analysis cleaned up during emergency stabilization',
  updated_at = now()
WHERE 
  status IN ('pending', 'analyzing') 
  AND created_at < now() - interval '1 hour';

-- Add critical indexes for performance (without CONCURRENTLY for transaction compatibility)
CREATE INDEX IF NOT EXISTS idx_analyses_status_user_created 
ON public.analyses(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_results_analysis_user 
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