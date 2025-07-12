-- Create profiles for existing users who don't have them yet
INSERT INTO public.profiles (user_id, email, full_name, role)
SELECT 
  au.id as user_id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name,
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'other') as role
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM public.profiles);