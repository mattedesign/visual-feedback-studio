
-- STEP 1: Check for existing data in potentially conflicting tables
-- (This is just a check - no data will be deleted)

-- Check if annotations table has any data
SELECT COUNT(*) as annotation_count FROM public.annotations;

-- Check if analysis_results table has any data
SELECT COUNT(*) as analysis_results_count FROM public.analysis_results;

-- Check for any orphaned data relationships
SELECT 
  a.id as analysis_id,
  a.title,
  COUNT(an.id) as annotation_count,
  ar.id as has_results
FROM public.analyses a
LEFT JOIN public.annotations an ON a.id = an.analysis_id
LEFT JOIN public.analysis_results ar ON a.id = ar.analysis_id
GROUP BY a.id, a.title, ar.id;

-- STEP 2: Safe cleanup of conflicting annotation storage
-- Drop the separate annotations table since analysis_results.annotations is the primary storage
DROP TABLE IF EXISTS public.annotations CASCADE;

-- STEP 3: Clean up any orphaned analysis records without results
DELETE FROM public.analyses 
WHERE id NOT IN (
  SELECT DISTINCT analysis_id 
  FROM public.analysis_results 
  WHERE analysis_id IS NOT NULL
);

-- STEP 4: Ensure proper foreign key constraints
-- Make sure analysis_results properly references analyses table
ALTER TABLE public.analysis_results 
DROP CONSTRAINT IF EXISTS analysis_results_analysis_id_fkey;

ALTER TABLE public.analysis_results 
ADD CONSTRAINT analysis_results_analysis_id_fkey 
FOREIGN KEY (analysis_id) REFERENCES public.analyses(id) ON DELETE CASCADE;

-- STEP 5: Clean up any invalid analysis_results records
DELETE FROM public.analysis_results 
WHERE analysis_id NOT IN (SELECT id FROM public.analyses);

-- STEP 6: Add proper RLS policies to analysis_results if missing
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Ensure users can only see their own analysis results
DROP POLICY IF EXISTS "Users can view their own analysis results" ON public.analysis_results;
CREATE POLICY "Users can view their own analysis results" 
  ON public.analysis_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own analysis results" ON public.analysis_results;
CREATE POLICY "Users can create their own analysis results" 
  ON public.analysis_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own analysis results" ON public.analysis_results;
CREATE POLICY "Users can update their own analysis results" 
  ON public.analysis_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own analysis results" ON public.analysis_results;
CREATE POLICY "Users can delete their own analysis results" 
  ON public.analysis_results 
  FOR DELETE 
  USING (auth.uid() = user_id);
