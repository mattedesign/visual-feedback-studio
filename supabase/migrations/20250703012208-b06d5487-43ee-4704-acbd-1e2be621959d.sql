-- First drop the constraint and recreate it with all needed plan types including yearly_100
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_type_check;

ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_type_check 
CHECK (plan_type IN ('trial', 'monthly_25', 'yearly_25', 'monthly_50', 'yearly_50', 'monthly_100', 'yearly_100', 'unlimited_admin'));

-- Now update sparkingmatt@gmail.com to yearly_100 plan with 100 analyses
UPDATE public.user_subscriptions 
SET 
    plan_type = 'yearly_100',
    analyses_limit = 100,
    analyses_used = 0,
    status = 'active'
WHERE user_id = '34a7f5e5-e9b7-459b-90d5-41c4e7da1cd2';

-- Ensure the profile exists with super admin privileges
INSERT INTO public.profiles (user_id, email, super_admin)
VALUES ('34a7f5e5-e9b7-459b-90d5-41c4e7da1cd2', 'sparkingmatt@gmail.com', true)
ON CONFLICT (user_id) DO UPDATE SET
    email = 'sparkingmatt@gmail.com',
    super_admin = true;