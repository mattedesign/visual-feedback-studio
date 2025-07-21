-- Visual Prototypes Storage Schema
-- Add visual prototype storage to existing analysis results

-- Create visual_prototypes table
CREATE TABLE IF NOT EXISTS public.figmant_visual_prototypes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.figmant_analysis_results(id) ON DELETE CASCADE,
  issue_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Hotspot positioning for overlay
  hotspot_x INTEGER NOT NULL,
  hotspot_y INTEGER NOT NULL, 
  hotspot_width INTEGER NOT NULL,
  hotspot_height INTEGER NOT NULL,
  hotspot_type TEXT NOT NULL DEFAULT 'pulse', -- 'pulse', 'glow', 'outline'
  
  -- Prototype code variations
  before_html TEXT,
  before_css TEXT,
  after_html TEXT NOT NULL,
  after_css TEXT NOT NULL,
  interactive_html TEXT,
  interactive_css TEXT,
  interactive_js TEXT,
  mobile_html TEXT,
  mobile_css TEXT,
  
  -- Explanations and metadata
  summary TEXT NOT NULL,
  key_changes JSONB DEFAULT '[]'::jsonb,
  business_impact TEXT,
  implementation_notes JSONB DEFAULT '[]'::jsonb,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_visual_prototypes_analysis_id ON public.figmant_visual_prototypes(analysis_id);
CREATE INDEX idx_visual_prototypes_category ON public.figmant_visual_prototypes(category);

-- Add prototype generation status to analysis results
ALTER TABLE public.figmant_analysis_results 
ADD COLUMN IF NOT EXISTS prototype_generation_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS prototype_generation_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS prototype_generation_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS prototype_count INTEGER DEFAULT 0;

-- Create function to update prototype count
CREATE OR REPLACE FUNCTION update_prototype_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE figmant_analysis_results 
  SET prototype_count = (
    SELECT COUNT(*) FROM figmant_visual_prototypes 
    WHERE analysis_id = COALESCE(NEW.analysis_id, OLD.analysis_id)
  )
  WHERE id = COALESCE(NEW.analysis_id, OLD.analysis_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update prototype count
CREATE TRIGGER trigger_update_prototype_count
  AFTER INSERT OR UPDATE OR DELETE ON figmant_visual_prototypes
  FOR EACH ROW EXECUTE FUNCTION update_prototype_count();