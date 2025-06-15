-- Add status column to team_members
ALTER TABLE public.team_members 
ADD COLUMN status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active'));

-- Set default role to 'member' for existing records
ALTER TABLE public.team_members 
ALTER COLUMN role SET DEFAULT 'member';

-- Update any existing NULL roles to 'member'
UPDATE public.team_members 
SET role = 'member' 
WHERE role IS NULL; 