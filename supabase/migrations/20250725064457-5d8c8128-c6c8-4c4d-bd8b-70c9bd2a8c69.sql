-- Enable RLS on missing tables
ALTER TABLE figmant_visual_prototypes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for figmant_visual_prototypes
CREATE POLICY "Users can manage prototypes for their own analyses" ON figmant_visual_prototypes
FOR ALL
USING (
  analysis_id IN (
    SELECT id FROM figmant_analysis_results 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  analysis_id IN (
    SELECT id FROM figmant_analysis_results 
    WHERE user_id = auth.uid()
  )
);