-- Step 1: Drop the constraint first
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_type_check;

-- Step 2: Update all existing data to new format
UPDATE public.user_subscriptions 
SET plan_type = 'yearly_25' 
WHERE plan_type = 'yearly';

UPDATE public.user_subscriptions 
SET plan_type = 'monthly_25' 
WHERE plan_type = 'monthly';

UPDATE public.user_subscriptions 
SET plan_type = 'trial' 
WHERE plan_type = 'freemium';

-- Step 3: Update sparkingmatt user to unlimited_admin
UPDATE public.user_subscriptions 
SET 
    plan_type = 'unlimited_admin',
    analyses_limit = 999999,
    analyses_used = 0,
    status = 'active'
WHERE user_id = '34a7f5e5-e9b7-459b-90d5-41c4e7da1cd2';

-- Step 4: Create the profile for the super admin user
INSERT INTO public.profiles (user_id, email, super_admin)
VALUES ('34a7f5e5-e9b7-459b-90d5-41c4e7da1cd2', 'sparkingmatt@gmail.com', true)
ON CONFLICT (user_id) DO UPDATE SET
    email = 'sparkingmatt@gmail.com',
    super_admin = true;

-- Step 5: Now add the constraint with all valid plan types
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_type_check 
CHECK (plan_type IN ('trial', 'monthly_25', 'yearly_25', 'monthly_50', 'yearly_50', 'monthly_100', 'yearly_100', 'unlimited_admin'));