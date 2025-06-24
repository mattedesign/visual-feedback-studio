
-- Fix foreign key constraints to allow CASCADE DELETE when users are deleted
-- This will automatically delete related analyses and uploaded_files when a user is deleted

-- First, we need to add the missing foreign key constraints with CASCADE DELETE
-- The analyses table references auth.users but the constraint might not be properly set

-- Add foreign key constraint for analyses table if it doesn't exist
DO $$ 
BEGIN
  -- Check if the foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'analyses_user_id_fkey' 
    AND table_name = 'analyses'
  ) THEN
    ALTER TABLE public.analyses 
    ADD CONSTRAINT analyses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ELSE
    -- If it exists, drop and recreate with CASCADE
    ALTER TABLE public.analyses 
    DROP CONSTRAINT analyses_user_id_fkey;
    
    ALTER TABLE public.analyses 
    ADD CONSTRAINT analyses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for uploaded_files table if it doesn't exist
DO $$ 
BEGIN
  -- Check if the foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'uploaded_files_user_id_fkey' 
    AND table_name = 'uploaded_files'
  ) THEN
    ALTER TABLE public.uploaded_files 
    ADD CONSTRAINT uploaded_files_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  ELSE
    -- If it exists, drop and recreate with CASCADE
    ALTER TABLE public.uploaded_files 
    DROP CONSTRAINT uploaded_files_user_id_fkey;
    
    ALTER TABLE public.uploaded_files 
    ADD CONSTRAINT uploaded_files_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure the uploaded_files -> analyses foreign key also uses CASCADE
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'uploaded_files_analysis_id_fkey' 
    AND table_name = 'uploaded_files'
  ) THEN
    ALTER TABLE public.uploaded_files 
    DROP CONSTRAINT uploaded_files_analysis_id_fkey;
  END IF;
  
  ALTER TABLE public.uploaded_files 
  ADD CONSTRAINT uploaded_files_analysis_id_fkey 
  FOREIGN KEY (analysis_id) REFERENCES public.analyses(id) ON DELETE CASCADE;
END $$;

-- Ensure the annotations -> analyses foreign key also uses CASCADE
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'annotations_analysis_id_fkey' 
    AND table_name = 'annotations'
  ) THEN
    ALTER TABLE public.annotations 
    DROP CONSTRAINT annotations_analysis_id_fkey;
  END IF;
  
  ALTER TABLE public.annotations 
  ADD CONSTRAINT annotations_analysis_id_fkey 
  FOREIGN KEY (analysis_id) REFERENCES public.analyses(id) ON DELETE CASCADE;
END $$;
