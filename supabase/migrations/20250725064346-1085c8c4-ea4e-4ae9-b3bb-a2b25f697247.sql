-- Fix RLS policies for figmant tables to handle joins properly

-- Update RLS policy for figmant_analysis_results to be more permissive for joins
DROP POLICY IF EXISTS "Users can view own analysis results" ON figmant_analysis_results;

CREATE POLICY "Users can view own analysis results" ON figmant_analysis_results
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  session_id IN (
    SELECT id FROM figmant_analysis_sessions 
    WHERE user_id = auth.uid()
  )
);

-- Update RLS policy for figmant_holistic_analyses to handle missing analysis_id
DROP POLICY IF EXISTS "Users can manage analyses for their own results" ON figmant_holistic_analyses;

CREATE POLICY "Users can manage analyses for their own results" ON figmant_holistic_analyses
FOR ALL
USING (
  analysis_id IN (
    SELECT id FROM figmant_analysis_results 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  analysis_id IN (
    SELECT id FROM figmant_analysis_results 
    WHERE user_id = auth.uid()
  )
);