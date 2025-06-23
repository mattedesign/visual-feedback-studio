
-- Ensure the analysis-files bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('analysis-files', 'analysis-files', true)
ON CONFLICT (id) DO NOTHING;

-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in analysis-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create comprehensive storage policies for the analysis-files bucket
CREATE POLICY "Allow authenticated uploads to analysis-files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'analysis-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public access to analysis-files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'analysis-files');

CREATE POLICY "Allow users to update their own files in analysis-files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'analysis-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own files in analysis-files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'analysis-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
