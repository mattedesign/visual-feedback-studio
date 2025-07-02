-- Update user_subscriptions table to support new subscription model
-- Change plan_type from 'freemium' to 'trial' and add monthly/yearly options
-- Update analyses_limit for monthly/yearly plans to 25

-- First, update existing freemium users to trial
UPDATE public.user_subscriptions 
SET plan_type = 'trial' 
WHERE plan_type = 'freemium';

-- Update the check constraint to allow new plan types
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_type_check;

ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_type_check 
CHECK (plan_type IN ('trial', 'monthly', 'yearly'));

-- Add super_admin flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN super_admin BOOLEAN DEFAULT false;

-- Set sparkingmatt@gmail.com as super admin
UPDATE public.profiles 
SET super_admin = true 
WHERE email = 'sparkingmatt@gmail.com';

-- Update the initialize_user_subscription function to use 'trial' instead of 'freemium'
CREATE OR REPLACE FUNCTION public.initialize_user_subscription(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  subscription_id UUID;
BEGIN
  -- Log the attempt
  RAISE LOG 'Initializing subscription for user: %', p_user_id;
  
  -- Insert new trial subscription for user
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_type,
    status,
    analyses_used,
    analyses_limit
  ) VALUES (
    p_user_id,
    'trial',
    'active',
    0,
    3
  )
  RETURNING id INTO subscription_id;
  
  RAISE LOG 'Successfully created subscription % for user %', subscription_id, p_user_id;
  RETURN subscription_id;
EXCEPTION
  WHEN unique_violation THEN
    -- User already has a subscription, return existing id
    RAISE LOG 'User % already has subscription, returning existing', p_user_id;
    SELECT id INTO subscription_id
    FROM public.user_subscriptions
    WHERE user_id = p_user_id;
    
    RETURN subscription_id;
  WHEN OTHERS THEN
    -- Log the error details for debugging
    RAISE LOG 'Error creating subscription for user %: % - %', p_user_id, SQLERRM, SQLSTATE;
    -- Re-raise the error so it can be handled upstream
    RAISE;
END;
$function$;

-- Update the check_analysis_limit function to handle super admin and new limits
CREATE OR REPLACE FUNCTION public.check_analysis_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
  user_status TEXT;
  user_plan TEXT;
  is_super_admin BOOLEAN;
BEGIN
  -- Check if user is super admin
  SELECT super_admin INTO is_super_admin
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Super admin has unlimited access
  IF is_super_admin = true THEN
    RETURN TRUE;
  END IF;
  
  -- Get current usage and limit for user
  SELECT analyses_used, analyses_limit, status, plan_type
  INTO current_usage, usage_limit, user_status, user_plan
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription found, initialize one
  IF NOT FOUND THEN
    PERFORM public.initialize_user_subscription(p_user_id);
    RETURN TRUE; -- New trial user can create analysis
  END IF;
  
  -- Check if subscription is active
  IF user_status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- For monthly/yearly plans, set limit to 25 if not already set
  IF (user_plan = 'monthly' OR user_plan = 'yearly') AND usage_limit != 25 THEN
    UPDATE public.user_subscriptions
    SET analyses_limit = 25
    WHERE user_id = p_user_id;
    usage_limit := 25;
  END IF;
  
  -- Check if user is within limit
  RETURN current_usage < usage_limit;
END;
$function$;

-- Update increment_analysis_usage function to handle super admin
CREATE OR REPLACE FUNCTION public.increment_analysis_usage(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
  user_plan TEXT;
  is_super_admin BOOLEAN;
BEGIN
  -- Check if user is super admin
  SELECT super_admin INTO is_super_admin
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Super admin has unlimited access, but still increment for tracking
  IF is_super_admin = true THEN
    UPDATE public.user_subscriptions
    SET 
      analyses_used = analyses_used + 1,
      updated_at = now()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  -- Get current usage and limit
  SELECT analyses_used, analyses_limit, plan_type
  INTO current_usage, usage_limit, user_plan
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription found, initialize one
  IF NOT FOUND THEN
    PERFORM public.initialize_user_subscription(p_user_id);
    current_usage := 0;
    usage_limit := 3;
    user_plan := 'trial';
  END IF;
  
  -- For monthly/yearly plans, ensure limit is 25
  IF (user_plan = 'monthly' OR user_plan = 'yearly') AND usage_limit != 25 THEN
    UPDATE public.user_subscriptions
    SET analyses_limit = 25
    WHERE user_id = p_user_id;
    usage_limit := 25;
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
$function$;