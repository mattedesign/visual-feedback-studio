-- Drop the problematic policy completely
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Create a function to check super admin status without recursion
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND super_admin = true
  );
$$;

-- Create new policy using the function to avoid recursion
CREATE POLICY "Super admins can view all profiles" ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id OR public.is_super_admin(auth.uid())
);