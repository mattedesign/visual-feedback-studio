-- Update competitor_patterns pattern_type check constraint to include business-focused types

-- First, drop the existing check constraint
ALTER TABLE public.competitor_patterns 
DROP CONSTRAINT IF EXISTS competitor_patterns_pattern_type_check;

-- Add the updated check constraint with all the pattern types used in the seeding script
ALTER TABLE public.competitor_patterns 
ADD CONSTRAINT competitor_patterns_pattern_type_check 
CHECK (pattern_type IN (
  'ui_pattern',
  'layout_pattern', 
  'interaction_pattern',
  'navigation_pattern',
  'form_pattern',
  'content_pattern',
  'conversion_optimization',
  'competitive_response',
  'launch_strategy', 
  'stakeholder_management'
));