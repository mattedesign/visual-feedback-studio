
-- Create analyses table to group uploaded files
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Analysis',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create uploaded_files table to store file metadata
CREATE TABLE public.uploaded_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  upload_type TEXT NOT NULL DEFAULT 'file' CHECK (upload_type IN ('file', 'url', 'figma')),
  original_url TEXT, -- for URL uploads
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('analysis-files', 'analysis-files', true);

-- Enable RLS on analyses table
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies for analyses
CREATE POLICY "Users can view their own analyses" 
  ON public.analyses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" 
  ON public.analyses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" 
  ON public.analyses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
  ON public.analyses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on uploaded_files table
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for uploaded_files
CREATE POLICY "Users can view their own uploaded files" 
  ON public.uploaded_files 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploaded files" 
  ON public.uploaded_files 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploaded files" 
  ON public.uploaded_files 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploaded files" 
  ON public.uploaded_files 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Storage policies for the analysis-files bucket
CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'analysis-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects
  FOR SELECT
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

-- Create indexes for better performance
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX idx_uploaded_files_analysis_id ON public.uploaded_files(analysis_id);
CREATE INDEX idx_uploaded_files_user_id ON public.uploaded_files(user_id);
