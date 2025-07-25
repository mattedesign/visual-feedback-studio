-- Enable RLS on knowledge_entries table
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;

-- Create a policy for knowledge_entries (they should be readable by everyone since they're knowledge base)
CREATE POLICY "Knowledge entries are publicly readable" ON knowledge_entries
FOR SELECT
USING (true);

-- Check and fix any RLS issues with figmant tables
-- Ensure figmant_analysis_results has proper policies for joins
DROP POLICY IF EXISTS "Users can view own analysis results" ON figmant_analysis_results;

CREATE POLICY "Users can view own analysis results" ON figmant_analysis_results
FOR SELECT
USING (
  user_id = auth.uid() 
  OR session_id IN (
    SELECT id FROM figmant_analysis_sessions 
    WHERE user_id = auth.uid()
  )
);