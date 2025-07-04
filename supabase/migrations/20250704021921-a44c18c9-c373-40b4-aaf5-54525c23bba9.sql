-- Create storage bucket for analysis images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('analysis-images', 'analysis-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for analysis images
CREATE POLICY "Anyone can view analysis images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'analysis-images');

CREATE POLICY "Authenticated users can upload analysis images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'analysis-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own analysis images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'analysis-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own analysis images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'analysis-images' AND auth.uid() IS NOT NULL);