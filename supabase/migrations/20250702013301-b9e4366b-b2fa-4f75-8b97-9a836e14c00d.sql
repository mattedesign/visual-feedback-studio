-- Update pipeline configurations to include Perplexity validation stage
-- Insert comprehensive analysis configuration with Perplexity validation

INSERT INTO public.pipeline_configurations (
  name,
  description,
  stages,
  weights,
  thresholds,
  enabled,
  version
) VALUES (
  'comprehensive_analysis',
  'Multi-stage analysis pipeline with Perplexity validation',
  '[
    {"name": "google_vision", "enabled": true, "timeout_ms": 30000, "retry_count": 2},
    {"name": "enhanced_ai_analysis", "enabled": true, "timeout_ms": 60000, "retry_count": 3},
    {"name": "perplexity_validation", "enabled": true, "timeout_ms": 45000, "retry_count": 2},
    {"name": "intelligent_synthesis", "enabled": true, "timeout_ms": 30000, "retry_count": 1}
  ]'::jsonb,
  '{
    "google_vision": 0.15,
    "ai_analysis": 0.40,
    "perplexity_validation": 0.30,
    "synthesis_quality": 0.15
  }'::jsonb,
  '{
    "min_confidence": 0.7,
    "min_annotations": 12,
    "max_annotations": 25,
    "quality_threshold": 0.8,
    "perplexity_validation_threshold": 0.6
  }'::jsonb,
  true,
  1
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  stages = EXCLUDED.stages,
  weights = EXCLUDED.weights,
  thresholds = EXCLUDED.thresholds,
  enabled = EXCLUDED.enabled,
  version = EXCLUDED.version,
  updated_at = now();