-- Add INSERT policies for database seeding

-- Allow authenticated users to insert problem statements (for seeding)
CREATE POLICY "Authenticated users can insert problem statements for seeding" 
ON public.problem_statements 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to insert contextual solutions (for seeding)
CREATE POLICY "Authenticated users can insert contextual solutions for seeding" 
ON public.contextual_solutions 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow service role to insert/update problem statements and contextual solutions
CREATE POLICY "Service role can manage problem statements" 
ON public.problem_statements 
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage contextual solutions" 
ON public.contextual_solutions 
FOR ALL
TO service_role  
USING (true)
WITH CHECK (true);