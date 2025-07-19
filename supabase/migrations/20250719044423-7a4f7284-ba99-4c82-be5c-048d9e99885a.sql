-- First, let's see what the current constraint allows
-- We need to drop the existing constraint and recreate it with the correct values

-- Drop the existing constraint
ALTER TABLE figmant_analysis_sessions DROP CONSTRAINT IF EXISTS figmant_analysis_sessions_status_check;

-- Add the correct constraint that matches our TypeScript interface
ALTER TABLE figmant_analysis_sessions 
ADD CONSTRAINT figmant_analysis_sessions_status_check 
CHECK (status IN ('draft', 'pending', 'processing', 'completed', 'failed'));