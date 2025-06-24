
-- First, drop the existing overly permissive policies that may be causing conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.knowledge_entries;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.knowledge_entries;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON public.knowledge_entries;

-- Create a service role policy that allows the edge function to access all knowledge entries
-- This policy will allow the service role (used by edge functions) to perform all operations
CREATE POLICY "Service role can access all knowledge entries" 
ON public.knowledge_entries 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create a public read policy that allows anyone to read knowledge entries
-- This is appropriate since knowledge entries are research data that should be publicly accessible
CREATE POLICY "Public read access to knowledge entries" 
ON public.knowledge_entries 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Create a policy for authenticated users to insert knowledge entries
CREATE POLICY "Authenticated users can insert knowledge entries" 
ON public.knowledge_entries 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create a policy for authenticated users to update knowledge entries
CREATE POLICY "Authenticated users can update knowledge entries" 
ON public.knowledge_entries 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Verify that RLS is enabled on the table
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
