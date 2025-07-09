-- Fix the conversation_stage constraint to allow 'chat' stage
ALTER TABLE goblin_refinement_history 
DROP CONSTRAINT IF EXISTS goblin_refinement_history_conversation_stage_check;

ALTER TABLE goblin_refinement_history 
ADD CONSTRAINT goblin_refinement_history_conversation_stage_check 
CHECK (conversation_stage = ANY (ARRAY['initial'::text, 'clarification'::text, 'refinement'::text, 'resolution'::text, 'chat'::text]));