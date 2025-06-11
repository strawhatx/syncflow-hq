-- Step 1: Create the enum type
CREATE TYPE stage AS ENUM ('connect', 'mapping', 'authorize', 'complete');

-- Step 2: Drop the default temporarily
ALTER TABLE public.syncs
  ALTER COLUMN setup_stage DROP DEFAULT;

-- Step 3: Alter the column type using CASE for mapping old values
ALTER TABLE public.syncs
  ALTER COLUMN setup_stage TYPE stage 
  USING CASE 
    WHEN setup_stage = 'connections' THEN 'connect'::stage
    WHEN setup_stage = 'completed' THEN 'complete'::stage
    ELSE setup_stage::stage
  END;

-- Step 4: Set the new default
ALTER TABLE public.syncs
  ALTER COLUMN setup_stage SET DEFAULT 'connect'::stage;
