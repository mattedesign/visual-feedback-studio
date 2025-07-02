-- Add support for new subscription tiers with different analysis limits
-- Update plan_type constraint to include new tiers
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_type_check;

ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_type_check 
CHECK (plan_type IN ('trial', 'monthly_25', 'yearly_25', 'monthly_50', 'yearly_50', 'monthly_100', 'yearly_100'));

-- Update existing monthly/yearly records to the new naming convention
UPDATE public.user_subscriptions 
SET plan_type = 'monthly_25' 
WHERE plan_type = 'monthly';

UPDATE public.user_subscriptions 
SET plan_type = 'yearly_25' 
WHERE plan_type = 'yearly';

-- Update the check_analysis_limit function to handle new plan types
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
  target_limit INTEGER;
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
  
  -- Determine target limit based on plan type
  CASE user_plan
    WHEN 'monthly_25', 'yearly_25' THEN target_limit := 25;
    WHEN 'monthly_50', 'yearly_50' THEN target_limit := 50;
    WHEN 'monthly_100', 'yearly_100' THEN target_limit := 100;
    WHEN 'trial' THEN target_limit := 3;
    ELSE target_limit := 25; -- default fallback
  END CASE;
  
  -- Update limit if it doesn't match the plan
  IF usage_limit != target_limit THEN
    UPDATE public.user_subscriptions
    SET analyses_limit = target_limit
    WHERE user_id = p_user_id;
    usage_limit := target_limit;
  END IF;
  
  -- Check if user is within limit
  RETURN current_usage < usage_limit;
END;
$function$;

-- Update the increment_analysis_usage function to handle new plan types
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
  target_limit INTEGER;
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
  
  -- Determine target limit based on plan type
  CASE user_plan
    WHEN 'monthly_25', 'yearly_25' THEN target_limit := 25;
    WHEN 'monthly_50', 'yearly_50' THEN target_limit := 50;
    WHEN 'monthly_100', 'yearly_100' THEN target_limit := 100;
    WHEN 'trial' THEN target_limit := 3;
    ELSE target_limit := 25; -- default fallback
  END CASE;
  
  -- Update limit if it doesn't match the plan
  IF usage_limit != target_limit THEN
    UPDATE public.user_subscriptions
    SET analyses_limit = target_limit
    WHERE user_id = p_user_id;
    usage_limit := target_limit;
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