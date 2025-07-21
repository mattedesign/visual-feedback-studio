-- Add automation preferences to user profiles
ALTER TABLE public.profiles 
ADD COLUMN automation_preferences JSONB DEFAULT '{
  "autoAnalysisEnabled": false,
  "smartTriggerThreshold": 2,
  "autoAnalysisDelay": 3000,
  "designChangeDetection": false,
  "batchProcessingEnabled": true,
  "notificationsEnabled": true
}'::jsonb;

-- Update the update trigger to handle the new column
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();