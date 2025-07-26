-- Update syncs table schema
-- Add status field and remove setup_stage and is_active

-- First, add the status column with a default value
ALTER TABLE public.syncs 
ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'error'));

-- Update existing records to set status based on is_active
UPDATE public.syncs 
SET status = CASE 
    WHEN is_active = true THEN 'active' 
    ELSE 'draft' 
END;

-- Remove the setup_stage column (it's being replaced by the stage field in the config)
ALTER TABLE public.syncs 
DROP COLUMN IF EXISTS setup_stage;

-- Remove the is_active column since we're using status now
ALTER TABLE public.syncs 
DROP COLUMN IF EXISTS is_active;

-- Create an index on status for better query performance
CREATE INDEX idx_syncs_status ON public.syncs(status);

-- Update the updated_at trigger
CREATE OR REPLACE FUNCTION update_syncs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_update_syncs_updated_at ON public.syncs;

-- Create the updated trigger
CREATE TRIGGER trg_update_syncs_updated_at
    BEFORE UPDATE ON public.syncs
    FOR EACH ROW
    EXECUTE FUNCTION update_syncs_updated_at(); 