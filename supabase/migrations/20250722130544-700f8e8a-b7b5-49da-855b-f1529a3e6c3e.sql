-- Add context_id column to figmant_analysis_results table
ALTER TABLE figmant_analysis_results 
ADD COLUMN context_id uuid REFERENCES figmant_user_contexts(id);