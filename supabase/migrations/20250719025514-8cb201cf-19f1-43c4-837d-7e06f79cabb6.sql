-- Create user subscription management system
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT CHECK (subscription_tier IN ('trial', 'starter', 'pro', 'enterprise')),
  subscription_end TIMESTAMPTZ,
  analyses_used INTEGER DEFAULT 0,
  analyses_limit INTEGER DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create analysis sessions table for tracking user analysis sessions
CREATE TABLE IF NOT EXISTS public.figmant_analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Analysis',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  industry TEXT,
  design_type TEXT,
  business_goals TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create images table for session images
CREATE TABLE IF NOT EXISTS public.figmant_session_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.figmant_analysis_sessions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  upload_order INTEGER DEFAULT 0,
  google_vision_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create analysis results table
CREATE TABLE IF NOT EXISTS public.figmant_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.figmant_analysis_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  claude_analysis JSONB NOT NULL,
  google_vision_summary JSONB,
  severity_breakdown JSONB,
  implementation_timeline JSONB,
  processing_time_ms INTEGER,
  ai_model_used TEXT DEFAULT 'claude-sonnet-4',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create credit usage tracking
CREATE TABLE IF NOT EXISTS public.credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.figmant_analysis_sessions(id),
  credits_consumed INTEGER NOT NULL,
  operation_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figmant_analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figmant_session_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figmant_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscribers
CREATE POLICY "Users can view own subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription" ON public.subscribers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role can manage subscriptions" ON public.subscribers
  FOR ALL USING (true);

-- RLS Policies for analysis sessions
CREATE POLICY "Users can manage own sessions" ON public.figmant_analysis_sessions
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for session images
CREATE POLICY "Users can manage own session images" ON public.figmant_session_images
  FOR ALL USING (
    session_id IN (
      SELECT id FROM public.figmant_analysis_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for analysis results
CREATE POLICY "Users can view own analysis results" ON public.figmant_analysis_results
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for credit usage
CREATE POLICY "Users can view own credit usage" ON public.credit_usage
  FOR SELECT USING (user_id = auth.uid());

-- Functions for subscription management
CREATE OR REPLACE FUNCTION public.check_analysis_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
  user_tier TEXT;
BEGIN
  -- Get current usage and limit
  SELECT analyses_used, analyses_limit, subscription_tier
  INTO current_usage, usage_limit, user_tier
  FROM public.subscribers
  WHERE user_id = p_user_id;
  
  -- If no subscription found, create trial
  IF NOT FOUND THEN
    INSERT INTO public.subscribers (user_id, email, subscription_tier, analyses_limit)
    SELECT p_user_id, email, 'trial', 3
    FROM auth.users WHERE id = p_user_id;
    RETURN TRUE;
  END IF;
  
  -- Check if within limit
  RETURN current_usage < usage_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_analysis_usage(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.subscribers
  SET 
    analyses_used = analyses_used + 1,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;