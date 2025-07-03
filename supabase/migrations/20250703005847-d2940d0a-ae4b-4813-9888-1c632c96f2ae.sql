-- Update the subscription for sparkingmatt user to unlimited_admin
UPDATE public.user_subscriptions 
SET 
    plan_type = 'unlimited_admin',
    analyses_limit = 999999,
    status = 'active'
WHERE user_id = '34a7f5e5-e9b7-459b-90d5-41c4e7da1cd2';

-- Create the profile for the super admin user
INSERT INTO public.profiles (user_id, email, super_admin)
VALUES ('34a7f5e5-e9b7-459b-90d5-41c4e7da1cd2', 'sparkingmatt@gmail.com', true)
ON CONFLICT (user_id) DO UPDATE SET
    email = 'sparkingmatt@gmail.com',
    super_admin = true;