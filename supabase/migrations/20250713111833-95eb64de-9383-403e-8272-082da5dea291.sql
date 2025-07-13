-- Remove mentor guidance columns that were added
ALTER TABLE goblin_analysis_sessions 
DROP COLUMN IF EXISTS mentor_guidance,
DROP COLUMN IF EXISTS redesign_html;