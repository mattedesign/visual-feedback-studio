-- First, let's see what users exist in user_subscriptions to find the correct user_id
-- We need to create a profile for the super admin user

-- Get the user_id from user_subscriptions where plan_type is unlimited_admin
-- and create a profile record for them
INSERT INTO public.profiles (user_id, email, super_admin)
SELECT 
    user_id, 
    'sparkingmatt@gmail.com' as email, 
    true as super_admin
FROM public.user_subscriptions 
WHERE plan_type = 'unlimited_admin'
ON CONFLICT (user_id) DO UPDATE SET
    email = 'sparkingmatt@gmail.com',
    super_admin = true;