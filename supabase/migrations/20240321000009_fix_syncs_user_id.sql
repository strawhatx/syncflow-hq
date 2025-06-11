-- Add back the user_id column
ALTER TABLE public.syncs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS policies to only use user_id ownership
DROP POLICY IF EXISTS "Users can view their own syncs" ON public.syncs;
DROP POLICY IF EXISTS "Users can create their own syncs" ON public.syncs;
DROP POLICY IF EXISTS "Users can update their own syncs" ON public.syncs;
DROP POLICY IF EXISTS "Users can delete their own syncs" ON public.syncs;

CREATE POLICY "Users can view their own syncs"
  ON public.syncs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own syncs"
  ON public.syncs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own syncs"
  ON public.syncs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own syncs"
  ON public.syncs
  FOR DELETE
  USING (auth.uid() = user_id); 