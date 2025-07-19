-- Update sparkingmatt@gmail.com to be a power user for testing with correct plan type
UPDATE public.subscribers 
SET 
  analyses_limit = 9999,
  subscription_tier = 'pro',
  subscribed = true,
  updated_at = now()
WHERE email = 'sparkingmatt@gmail.com';

-- Also update user_subscriptions table if the user exists there with valid plan type
UPDATE public.user_subscriptions 
SET 
  analyses_limit = 9999,
  plan_type = 'pro',
  status = 'active',
  updated_at = now()
WHERE user_id IN (
  SELECT user_id FROM public.profiles WHERE email = 'sparkingmatt@gmail.com'
);