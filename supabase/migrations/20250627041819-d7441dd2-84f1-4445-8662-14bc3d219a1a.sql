
-- First, let's check what categories are currently allowed
SELECT DISTINCT category FROM knowledge_entries;

-- Let's also check if there's a check constraint on the category column
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'knowledge_entries'::regclass 
AND contype = 'c';
