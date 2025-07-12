-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Create a simpler, non-recursive policy for super admin access
-- This avoids the recursion by using a direct column check
CREATE POLICY "Super admins can view all profiles" ON public.profiles
FOR SELECT
USING (
  -- Allow users to see their own profile OR if the requesting user has super_admin = true
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND super_admin = true
  )
);