-- Add created_by column to syncs table to reference profiles
-- This makes it consistent with the teams table and provides better data integrity

-- Add the created_by column to reference profiles(id)
ALTER TABLE public.syncs 
ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add a comment to document the column
COMMENT ON COLUMN public.syncs.created_by IS 'References the user profile who created this sync, consistent with teams.created_by'; 