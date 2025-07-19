-- Update sparkingmatt@gmail.com to be a power user for testing
UPDATE public.subscribers 
SET 
  analyses_limit = 9999,
  subscription_tier = 'enterprise',
  subscribed = true,
  updated_at = now()
WHERE email = 'sparkingmatt@gmail.com';

-- Also update user_subscriptions table if the user exists there
UPDATE public.user_subscriptions 
SET 
  analyses_limit = 9999,
  plan_type = 'enterprise',
  status = 'active',
  updated_at = now()
WHERE user_id IN (
  SELECT user_id FROM public.profiles WHERE email = 'sparkingmatt@gmail.com'
);

-- If the user doesn't exist in subscribers yet, this will handle it when they next try to analyze
-- The edge function will create the record automatically