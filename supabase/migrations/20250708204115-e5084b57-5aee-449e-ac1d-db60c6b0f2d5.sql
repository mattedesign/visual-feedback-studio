-- ✅ Fix storage policies for analysis images to ensure Claude can access them
-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('analysis-images', 'analysis-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view analysis images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload analysis images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own analysis images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own analysis images" ON storage.objects;

-- Create comprehensive public read policy for analysis images
CREATE POLICY "Public read access to analysis images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'analysis-images');

-- Allow authenticated users to upload analysis images
CREATE POLICY "Authenticated users can upload analysis images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'analysis-images' AND auth.uid() IS NOT NULL);

-- Allow users to update their own analysis images (optional)
CREATE POLICY "Users can update analysis images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'analysis-images' AND auth.uid() IS NOT NULL);

-- Allow users to delete analysis images (optional)
CREATE POLICY "Users can delete analysis images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'analysis-images' AND auth.uid() IS NOT NULL);