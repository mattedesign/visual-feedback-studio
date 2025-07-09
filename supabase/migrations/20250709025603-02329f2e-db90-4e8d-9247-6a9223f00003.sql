-- Fix the conversation_stage constraint to allow 'chat' stage
DROP CONSTRAINT IF EXISTS goblin_refinement_history_conversation_stage_check ON goblin_refinement_history;

ALTER TABLE goblin_refinement_history 
ADD CONSTRAINT goblin_refinement_history_conversation_stage_check 
CHECK (conversation_stage = ANY (ARRAY['initial'::text, 'clarification'::text, 'refinement'::text, 'resolution'::text, 'chat'::text]));