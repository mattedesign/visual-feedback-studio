-- First, let's see what data we have and fix any inconsistencies
-- Update any super admin records to have reasonable limits while maintaining their status
UPDATE public.user_subscriptions 
SET analyses_limit = CASE 
  WHEN plan_type = 'trial' THEN 3
  WHEN plan_type IN ('monthly', 'monthly_25') THEN 25
  WHEN plan_type IN ('yearly', 'yearly_25') THEN 25
  ELSE analyses_limit
END
WHERE analyses_limit > 1000; -- Fix unreasonably high limits

-- Update existing data to use the new naming convention
UPDATE public.user_subscriptions 
SET plan_type = 'monthly_25' 
WHERE plan_type = 'monthly';

UPDATE public.user_subscriptions 
SET plan_type = 'yearly_25' 
WHERE plan_type = 'yearly';

-- Update any remaining legacy freemium records to trial
UPDATE public.user_subscriptions 
SET plan_type = 'trial' 
WHERE plan_type = 'freemium';

-- Now we can safely apply the constraint
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_type_check;

ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_type_check 
CHECK (plan_type IN ('trial', 'monthly_25', 'yearly_25', 'monthly_50', 'yearly_50', 'monthly_100', 'yearly_100'));