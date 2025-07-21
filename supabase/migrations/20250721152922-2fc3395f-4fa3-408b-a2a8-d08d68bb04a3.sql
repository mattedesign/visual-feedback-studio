-- Step 1.3: Database Schema Extensions for Figmant
-- Add enhanced metadata tracking columns to figmant_analysis_results

-- Check current structure first
\d figmant_analysis_results;

-- Add pattern violation tracking if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'figmant_analysis_results' 
                   AND column_name = 'pattern_violations') THEN
        ALTER TABLE figmant_analysis_results 
        ADD COLUMN pattern_violations JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add confidence metadata if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'figmant_analysis_results' 
                   AND column_name = 'confidence_metadata') THEN
        ALTER TABLE figmant_analysis_results 
        ADD COLUMN confidence_metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Add screen type detection if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'figmant_analysis_results' 
                   AND column_name = 'screen_type_detected') THEN
        ALTER TABLE figmant_analysis_results 
        ADD COLUMN screen_type_detected TEXT;
    END IF;
END $$;

-- Add enhanced business metrics if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'figmant_analysis_results' 
                   AND column_name = 'enhanced_business_metrics') THEN
        ALTER TABLE figmant_analysis_results 
        ADD COLUMN enhanced_business_metrics JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Add enhanced metadata tracking to figmant_analysis_sessions

-- Add screen detection metadata if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'figmant_analysis_sessions' 
                   AND column_name = 'screen_detection_metadata') THEN
        ALTER TABLE figmant_analysis_sessions 
        ADD COLUMN screen_detection_metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Add pattern tracking enabled flag if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'figmant_analysis_sessions' 
                   AND column_name = 'pattern_tracking_enabled') THEN
        ALTER TABLE figmant_analysis_sessions 
        ADD COLUMN pattern_tracking_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add confidence threshold if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'figmant_analysis_sessions' 
                   AND column_name = 'confidence_threshold') THEN
        ALTER TABLE figmant_analysis_sessions 
        ADD COLUMN confidence_threshold NUMERIC DEFAULT 0.7;
    END IF;
END $$;

-- Create index for pattern violations for better query performance
CREATE INDEX IF NOT EXISTS idx_figmant_pattern_violations 
ON figmant_analysis_results USING GIN(pattern_violations);

-- Create index for screen type detection
CREATE INDEX IF NOT EXISTS idx_figmant_screen_type 
ON figmant_analysis_results (screen_type_detected);

-- Add helpful comment
COMMENT ON COLUMN figmant_analysis_results.pattern_violations 
IS 'Array of violated UX patterns detected during analysis';

COMMENT ON COLUMN figmant_analysis_results.confidence_metadata 
IS 'Confidence scoring metadata for all analysis elements';

COMMENT ON COLUMN figmant_analysis_sessions.screen_detection_metadata 
IS 'Metadata from screen type auto-detection process';