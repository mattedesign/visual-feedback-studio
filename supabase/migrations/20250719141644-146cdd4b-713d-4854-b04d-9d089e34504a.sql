-- Update sparkingmatt@gmail.com to be a power user for testing
UPDATE public.subscribers 
SET 
  analyses_limit = 9999,
  subscription_tier = 'trial',
  subscribed = true,
  updated_at = now()
WHERE email = 'sparkingmatt@gmail.com';

-- Update user_subscriptions table with valid unlimited plan type
UPDATE public.user_subscriptions 
SET 
  analyses_limit = 9999,
  plan_type = 'unlimited_admin',
  status = 'active',
  updated_at = now()
WHERE user_id IN (
  SELECT user_id FROM public.profiles WHERE email = 'sparkingmatt@gmail.com'
);