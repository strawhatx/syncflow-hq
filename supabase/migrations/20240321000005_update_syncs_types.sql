-- Drop existing types with CASCADE to handle dependencies
DROP TYPE IF EXISTS sync_direction CASCADE;
DROP TYPE IF EXISTS conflict_resolution CASCADE;

-- Create new types
CREATE TYPE sync_direction AS ENUM ('one-way', 'two-way');
CREATE TYPE conflict_resolution AS ENUM ('source', 'destination', 'latest');

-- Add columns if they don't exist
ALTER TABLE public.syncs
  ADD COLUMN IF NOT EXISTS sync_direction text,
  ADD COLUMN IF NOT EXISTS conflict_resolution text;

-- Update syncs table to use the new types
ALTER TABLE public.syncs
  ALTER COLUMN sync_direction TYPE sync_direction USING sync_direction::sync_direction,
  ALTER COLUMN conflict_resolution TYPE conflict_resolution USING conflict_resolution::conflict_resolution; 