-- Phase 1, Step 1.3: Database Schema Extensions
-- Enhanced metadata tracking columns for better analytics and result storage

-- Add enhanced metadata columns to analysis_results table
ALTER TABLE public.analysis_results 
ADD COLUMN IF NOT EXISTS confidence_metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pattern_violations jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS enhanced_business_metrics jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS screen_type_detected text,
ADD COLUMN IF NOT EXISTS vision_enrichment_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS design_tokens_extracted jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS responsive_analysis jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS triage_classification jsonb DEFAULT '{}';

-- Add enhanced metadata columns to analyses table  
ALTER TABLE public.analyses
ADD COLUMN IF NOT EXISTS enhanced_metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pattern_tracking_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS confidence_threshold decimal(3,2) DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS screen_detection_metadata jsonb DEFAULT '{}';

-- Add enhanced metadata to figmant_analysis_results
ALTER TABLE public.figmant_analysis_results
ADD COLUMN IF NOT EXISTS enhanced_metadata_tracking jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pattern_analysis_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS confidence_scores jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS business_impact_enhanced jsonb DEFAULT '{}';

-- Create indexes for better performance on new JSONB columns
CREATE INDEX IF NOT EXISTS idx_analysis_results_confidence_metadata 
ON public.analysis_results USING gin(confidence_metadata);

CREATE INDEX IF NOT EXISTS idx_analysis_results_pattern_violations 
ON public.analysis_results USING gin(pattern_violations);

CREATE INDEX IF NOT EXISTS idx_analysis_results_screen_type 
ON public.analysis_results(screen_type_detected);

CREATE INDEX IF NOT EXISTS idx_analyses_enhanced_metadata 
ON public.analyses USING gin(enhanced_metadata);

CREATE INDEX IF NOT EXISTS idx_figmant_results_enhanced_metadata 
ON public.figmant_analysis_results USING gin(enhanced_metadata_tracking);

-- Add helpful comments to document the new columns
COMMENT ON COLUMN public.analysis_results.confidence_metadata IS 'Stores confidence scores and validation data for analysis results';
COMMENT ON COLUMN public.analysis_results.pattern_violations IS 'Array of design pattern violations detected during analysis';
COMMENT ON COLUMN public.analysis_results.enhanced_business_metrics IS 'Enhanced business impact calculations and ROI data';
COMMENT ON COLUMN public.analysis_results.screen_type_detected IS 'Auto-detected screen type from vision analysis';
COMMENT ON COLUMN public.analysis_results.vision_enrichment_data IS 'Enriched vision API data with contextual understanding';
COMMENT ON COLUMN public.analysis_results.design_tokens_extracted IS 'Extracted design system tokens and style information';
COMMENT ON COLUMN public.analysis_results.responsive_analysis IS 'Responsive design analysis and recommendations';
COMMENT ON COLUMN public.analysis_results.triage_classification IS 'Automated triage and priority classification data';

COMMENT ON COLUMN public.analyses.enhanced_metadata IS 'Enhanced analysis context and configuration metadata';
COMMENT ON COLUMN public.analyses.pattern_tracking_enabled IS 'Whether design pattern tracking is enabled for this analysis';
COMMENT ON COLUMN public.analyses.confidence_threshold IS 'Minimum confidence threshold for including analysis results';
COMMENT ON COLUMN public.analyses.screen_detection_metadata IS 'Metadata from automatic screen type detection';