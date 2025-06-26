
-- Update sparkingmatt@gmail.com user account with test credits
-- First, let's find and update the user subscription for sparkingmatt@gmail.com
UPDATE public.user_subscriptions 
SET 
  analyses_used = 0,
  analyses_limit = 20,
  updated_at = now()
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'sparkingmatt@gmail.com'
);

-- If no subscription exists for this user, create one with test credits
INSERT INTO public.user_subscriptions (
  user_id,
  plan_type,
  status,
  analyses_used,
  analyses_limit,
  created_at,
  updated_at
)
SELECT 
  auth_users.id,
  'freemium',
  'active',
  0,
  20,
  now(),
  now()
FROM auth.users auth_users
WHERE auth_users.email = 'sparkingmatt@gmail.com'
  AND NOT EXISTS (
    SELECT 1 
    FROM public.user_subscriptions us 
    WHERE us.user_id = auth_users.id
  );
