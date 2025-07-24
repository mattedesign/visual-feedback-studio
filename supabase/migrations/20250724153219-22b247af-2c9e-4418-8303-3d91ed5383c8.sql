-- Update user_id column type to text to support anonymous users
ALTER TABLE figmant_analysis_sessions ALTER COLUMN user_id TYPE text;
ALTER TABLE figmant_analysis_results ALTER COLUMN user_id TYPE text;

-- Update RLS policies to allow anonymous analysis  
DROP POLICY IF EXISTS "Users can manage sessions" ON figmant_analysis_sessions;
CREATE POLICY "Users can manage sessions" ON figmant_analysis_sessions
  FOR ALL
  USING (user_id = COALESCE(auth.uid()::text, 'anonymous'));

DROP POLICY IF EXISTS "Users can manage session images" ON figmant_session_images;  
CREATE POLICY "Users can manage session images" ON figmant_session_images
  FOR ALL  
  USING (session_id IN (
    SELECT id FROM figmant_analysis_sessions 
    WHERE user_id = COALESCE(auth.uid()::text, 'anonymous')
  ));

DROP POLICY IF EXISTS "Users can view analysis results" ON figmant_analysis_results;
CREATE POLICY "Users can view analysis results" ON figmant_analysis_results
  FOR ALL
  USING (user_id = COALESCE(auth.uid()::text, 'anonymous'));

-- Update storage policies for anonymous uploads
DROP POLICY IF EXISTS "Allow analysis uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow analysis downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow analysis updates" ON storage.objects; 
DROP POLICY IF EXISTS "Allow analysis deletes" ON storage.objects;

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