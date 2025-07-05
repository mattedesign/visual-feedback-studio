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