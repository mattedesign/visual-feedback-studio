-- Drop ALL policies on tables that will be modified
DROP POLICY IF EXISTS "Users can manage own sessions" ON figmant_analysis_sessions;
DROP POLICY IF EXISTS "Users can manage sessions" ON figmant_analysis_sessions;
DROP POLICY IF EXISTS "Users can manage own session images" ON figmant_session_images;
DROP POLICY IF EXISTS "Users can manage session images" ON figmant_session_images;
DROP POLICY IF EXISTS "Users can view own analysis results" ON figmant_analysis_results;
DROP POLICY IF EXISTS "Users can view analysis results" ON figmant_analysis_results;

-- Update user_id column type to text to support anonymous users
ALTER TABLE figmant_analysis_sessions ALTER COLUMN user_id TYPE text;
ALTER TABLE figmant_analysis_results ALTER COLUMN user_id TYPE text;

-- Recreate RLS policies to allow anonymous analysis  
CREATE POLICY "Users can manage sessions" ON figmant_analysis_sessions
  FOR ALL
  USING (user_id = COALESCE(auth.uid()::text, 'anonymous'));

CREATE POLICY "Users can manage session images" ON figmant_session_images
  FOR ALL  
  USING (session_id IN (
    SELECT id FROM figmant_analysis_sessions 
    WHERE user_id = COALESCE(auth.uid()::text, 'anonymous')
  ));

CREATE POLICY "Users can view analysis results" ON figmant_analysis_results
  FOR ALL
  USING (user_id = COALESCE(auth.uid()::text, 'anonymous'));

-- Update storage policies for anonymous uploads (allow all operations on analysis-images bucket)
CREATE POLICY "Allow analysis uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'analysis-images');

CREATE POLICY "Allow analysis downloads" ON storage.objects  
  FOR SELECT
  USING (bucket_id = 'analysis-images');

CREATE POLICY "Allow analysis updates" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'analysis-images');

CREATE POLICY "Allow analysis deletes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'analysis-images');