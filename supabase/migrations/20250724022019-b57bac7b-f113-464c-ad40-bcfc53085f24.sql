-- Clean up duplicate records in figmant_holistic_analyses
-- Keep only the most recent analysis for each analysis_id

WITH ranked_analyses AS (
  SELECT id, analysis_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY analysis_id ORDER BY created_at DESC) as rn
  FROM figmant_holistic_analyses
),
duplicates_to_delete AS (
  SELECT id FROM ranked_analyses WHERE rn > 1
)
DELETE FROM figmant_holistic_analyses 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Add unique constraint to prevent future duplicates
ALTER TABLE figmant_holistic_analyses 
ADD CONSTRAINT unique_analysis_id_holistic 
UNIQUE (analysis_id);

-- Clean up orphaned solution metrics
DELETE FROM figmant_solution_metrics 
WHERE prototype_id NOT IN (
  SELECT id FROM figmant_holistic_prototypes
);

-- Add logging for debugging
CREATE OR REPLACE FUNCTION log_holistic_analysis_creation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE LOG 'Creating holistic analysis: analysis_id=%, created_at=%', NEW.analysis_id, NEW.created_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging
DROP TRIGGER IF EXISTS trigger_log_holistic_analysis ON figmant_holistic_analyses;
CREATE TRIGGER trigger_log_holistic_analysis
  BEFORE INSERT ON figmant_holistic_analyses
  FOR EACH ROW
  EXECUTE FUNCTION log_holistic_analysis_creation();