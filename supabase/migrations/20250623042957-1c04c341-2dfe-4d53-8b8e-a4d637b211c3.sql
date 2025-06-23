
-- Add image_index column to annotations table to track which image each annotation belongs to
ALTER TABLE public.annotations 
ADD COLUMN image_index INTEGER DEFAULT 0;

-- Add a comment to document the column
COMMENT ON COLUMN public.annotations.image_index IS 'Index of the image this annotation applies to (0-based)';
