
-- First, let's check the current plan_type constraint and fix it to accept 'trial'
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_type_check;

-- Add updated constraint that accepts both 'freemium' and 'trial' (and other valid values)
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_type_check 
CHECK (plan_type IN ('freemium', 'trial', 'monthly', 'yearly'));

-- Update the initialize_user_subscription function with better error handling
CREATE OR REPLACE FUNCTION public.initialize_user_subscription(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Update the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_id UUID;
BEGIN
  BEGIN
    -- Log the trigger execution
    RAISE LOG 'Trigger fired for new user: %', NEW.id;
    
    -- Initialize subscription for new user
    SELECT public.initialize_user_subscription(NEW.id) INTO result_id;
    
    RAISE LOG 'Successfully initialized subscription % for user %', result_id, NEW.id;
    
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't block user creation
      RAISE LOG 'Failed to initialize subscription for user %: % - %', NEW.id, SQLERRM, SQLSTATE;
      
      -- Return NEW to allow user creation to proceed even if subscription creation fails
      RETURN NEW;
  END;
END;
$$;
