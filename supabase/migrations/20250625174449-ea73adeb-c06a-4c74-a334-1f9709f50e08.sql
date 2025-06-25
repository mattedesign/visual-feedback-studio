
-- Migration: Add subscription tracking system
-- This adds user subscription management without breaking existing functionality

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  plan_type TEXT DEFAULT 'freemium' CHECK (plan_type IN ('freemium', 'monthly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  analyses_used INTEGER DEFAULT 0,
  analyses_limit INTEGER DEFAULT 3,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id) -- Ensure one subscription per user
);

-- Create function to initialize user subscription
CREATE OR REPLACE FUNCTION public.initialize_user_subscription(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_id UUID;
BEGIN
  -- Insert new freemium subscription for user
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_type,
    status,
    analyses_used,
    analyses_limit
  ) VALUES (
    p_user_id,
    'freemium',
    'active',
    0,
    3
  )
  RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
EXCEPTION
  WHEN unique_violation THEN
    -- User already has a subscription, return existing id
    SELECT id INTO subscription_id
    FROM public.user_subscriptions
    WHERE user_id = p_user_id;
    
    RETURN subscription_id;
END;
$$;

-- Create function to check analysis limit
CREATE OR REPLACE FUNCTION public.check_analysis_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
  user_status TEXT;
BEGIN
  -- Get current usage and limit for user
  SELECT analyses_used, analyses_limit, status
  INTO current_usage, usage_limit, user_status
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription found, initialize one
  IF NOT FOUND THEN
    PERFORM public.initialize_user_subscription(p_user_id);
    RETURN TRUE; -- New freemium user can create analysis
  END IF;
  
  -- Check if subscription is active
  IF user_status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is within limit
  RETURN current_usage < usage_limit;
END;
$$;

-- Create function to increment analysis usage
CREATE OR REPLACE FUNCTION public.increment_analysis_usage(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
BEGIN
  -- Get current usage and limit
  SELECT analyses_used, analyses_limit
  INTO current_usage, usage_limit
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription found, initialize one
  IF NOT FOUND THEN
    PERFORM public.initialize_user_subscription(p_user_id);
    current_usage := 0;
    usage_limit := 3;
  END IF;
  
  -- Check if user can increment (within limit)
  IF current_usage >= usage_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage counter
  UPDATE public.user_subscriptions
  SET 
    analyses_used = analyses_used + 1,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Create trigger function to auto-initialize subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Initialize subscription for new user
  PERFORM public.initialize_user_subscription(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger to auto-initialize subscription on user signup
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- Enable Row Level Security on user_subscriptions table
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access only
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can insert/update for Stripe webhooks and system operations
CREATE POLICY "Service role can manage all subscriptions"
  ON public.user_subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_plan_type ON public.user_subscriptions(plan_type);

-- Add comment to document the table
COMMENT ON TABLE public.user_subscriptions IS 'Tracks user subscription status and usage limits for analysis features';
