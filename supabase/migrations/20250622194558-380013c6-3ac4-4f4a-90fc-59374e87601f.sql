
-- Create annotations table to store AI-generated feedback
CREATE TABLE public.annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  x DECIMAL(5,2) NOT NULL, -- X coordinate as percentage (0-100)
  y DECIMAL(5,2) NOT NULL, -- Y coordinate as percentage (0-100)
  category TEXT NOT NULL CHECK (category IN ('ux', 'visual', 'accessibility', 'conversion', 'brand')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'suggested', 'enhancement')),
  feedback TEXT NOT NULL,
  implementation_effort TEXT NOT NULL CHECK (implementation_effort IN ('low', 'medium', 'high')),
  business_impact TEXT NOT NULL CHECK (business_impact IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add analysis context columns to analyses table
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS design_type TEXT CHECK (design_type IN ('landing', 'dashboard', 'mobile', 'ecommerce', 'other')),
ADD COLUMN IF NOT EXISTS business_goals TEXT[], -- Array of business goals
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS analysis_prompt TEXT, -- The prompt used for AI analysis
ADD COLUMN IF NOT EXISTS ai_model_used TEXT DEFAULT 'gpt-4o-mini',
ADD COLUMN IF NOT EXISTS analysis_completed_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on annotations table
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for annotations
CREATE POLICY "Users can view annotations for their analyses" 
  ON public.annotations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses 
      WHERE analyses.id = annotations.analysis_id 
      AND analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert annotations for their analyses" 
  ON public.annotations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analyses 
      WHERE analyses.id = annotations.analysis_id 
      AND analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update annotations for their analyses" 
  ON public.annotations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses 
      WHERE analyses.id = annotations.analysis_id 
      AND analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete annotations for their analyses" 
  ON public.annotations 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses 
      WHERE analyses.id = annotations.analysis_id 
      AND analyses.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_annotations_analysis_id ON public.annotations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_annotations_category ON public.annotations(category);
CREATE INDEX IF NOT EXISTS idx_annotations_severity ON public.annotations(severity);
CREATE INDEX IF NOT EXISTS idx_analyses_user_status ON public.analyses(user_id, status);

-- Add RLS policies for analyses table (if not already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analyses' 
    AND policyname = 'Users can view their own analyses'
  ) THEN
    CREATE POLICY "Users can view their own analyses" 
      ON public.analyses 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analyses' 
    AND policyname = 'Users can create their own analyses'
  ) THEN
    CREATE POLICY "Users can create their own analyses" 
      ON public.analyses 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analyses' 
    AND policyname = 'Users can update their own analyses'
  ) THEN
    CREATE POLICY "Users can update their own analyses" 
      ON public.analyses 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analyses' 
    AND policyname = 'Users can delete their own analyses'
  ) THEN
    CREATE POLICY "Users can delete their own analyses" 
      ON public.analyses 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Enable RLS on analyses table if not already enabled
ALTER TABLE public.analyses ENABLE ROW LEVEL Security;

-- Add RLS policies for uploaded_files table (if not already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'uploaded_files' 
    AND policyname = 'Users can view their own files'
  ) THEN
    CREATE POLICY "Users can view their own files" 
      ON public.uploaded_files 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'uploaded_files' 
    AND policyname = 'Users can create their own files'
  ) THEN
    CREATE POLICY "Users can create their own files" 
      ON public.uploaded_files 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'uploaded_files' 
    AND policyname = 'Users can update their own files'
  ) THEN
    CREATE POLICY "Users can update their own files" 
      ON public.uploaded_files 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'uploaded_files' 
    AND policyname = 'Users can delete their own files'
  ) THEN
    CREATE POLICY "Users can delete their own files" 
      ON public.uploaded_files 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Enable RLS on uploaded_files table if not already enabled
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL Security;
