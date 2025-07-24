-- Update RLS policies to allow anonymous analysis (fixed type casting)
-- Allow anonymous users to create and manage analysis sessions

-- Update figmant_analysis_sessions policies
DROP POLICY IF EXISTS "Users can manage own sessions" ON figmant_analysis_sessions;

CREATE POLICY "Users can manage sessions" ON figmant_analysis_sessions
  FOR ALL
  USING (user_id = COALESCE(auth.uid()::text, 'anonymous'));

-- Update figmant_session_images policies  
DROP POLICY IF EXISTS "Users can manage own session images" ON figmant_session_images;

CREATE POLICY "Users can manage session images" ON figmant_session_images
  FOR ALL  
  USING (session_id IN (
    SELECT id FROM figmant_analysis_sessions 
    WHERE user_id = COALESCE(auth.uid()::text, 'anonymous')
  ));

-- Update figmant_analysis_results policies
DROP POLICY IF EXISTS "Users can view own analysis results" ON figmant_analysis_results;

CREATE POLICY "Users can view analysis results" ON figmant_analysis_results
  FOR ALL
  USING (user_id::text = COALESCE(auth.uid()::text, 'anonymous'));

-- Update storage policies to allow anonymous uploads
INSERT INTO storage.objects (bucket_id, name, owner, metadata) 
VALUES ('analysis-images', '.keep', null, '{}') 
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Give users access to own folder 1ffg0_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ffg0_1" ON storage.objects;  
DROP POLICY IF EXISTS "Give users access to own folder 1ffg0_2" ON storage.objects;

-- Create new policies for anonymous analysis
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