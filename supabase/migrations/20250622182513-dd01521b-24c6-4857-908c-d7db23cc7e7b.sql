
-- Create storage bucket for uploaded files if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('analysis-files', 'analysis-files', true)
ON CONFLICT (id) DO NOTHING;

-- Update storage policies to be more permissive for authenticated users
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create more comprehensive storage policies
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'analysis-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view files in analysis-files bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'analysis-files');

CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'analysis-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'analysis-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update uploaded_files table to handle different upload types better
ALTER TABLE public.uploaded_files 
ADD COLUMN IF NOT EXISTS figma_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS public_url TEXT;

-- Add a check constraint to ensure proper upload type data
ALTER TABLE public.uploaded_files 
DROP CONSTRAINT IF EXISTS proper_upload_type_data;

-- Update the upload_type constraint to include new types
ALTER TABLE public.uploaded_files 
DROP CONSTRAINT IF EXISTS uploaded_files_upload_type_check;

ALTER TABLE public.uploaded_files 
ADD CONSTRAINT uploaded_files_upload_type_check 
CHECK (upload_type IN ('file', 'url', 'figma', 'website'));
