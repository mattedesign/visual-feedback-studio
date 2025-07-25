-- Fix duplicate key constraint and add proper unique constraint
-- Add unique constraint to prevent duplicate holistic analyses
DO $$ 
BEGIN
    -- First check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_analysis_id_holistic' 
        AND table_name = 'figmant_holistic_analyses'
    ) THEN
        -- Add unique constraint on analysis_id
        ALTER TABLE public.figmant_holistic_analyses 
        ADD CONSTRAINT unique_analysis_id_holistic UNIQUE (analysis_id);
    END IF;
END $$;

-- Ensure proper indexing for performance
CREATE INDEX IF NOT EXISTS idx_figmant_holistic_analyses_analysis_id 
ON public.figmant_holistic_analyses (analysis_id);

-- Add indexes for better visual prototype performance  
CREATE INDEX IF NOT EXISTS idx_figmant_visual_prototypes_analysis_id 
ON public.figmant_visual_prototypes (analysis_id);

CREATE INDEX IF NOT EXISTS idx_figmant_analysis_results_session_id 
ON public.figmant_analysis_results (session_id);

-- Fix potential race condition in prototype generation status
CREATE INDEX IF NOT EXISTS idx_figmant_analysis_prototype_status 
ON public.figmant_analysis_results (prototype_generation_status, created_at);