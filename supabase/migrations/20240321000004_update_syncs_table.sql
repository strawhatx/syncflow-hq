-- Update syncs table to use connection IDs
ALTER TABLE public.syncs
  DROP COLUMN IF EXISTS source_integration_id,
  DROP COLUMN IF EXISTS destination_integration_id,
  ADD COLUMN IF NOT EXISTS source_connection_id UUID REFERENCES public.integration_connections(id),
  ADD COLUMN IF NOT EXISTS destination_connection_id UUID REFERENCES public.integration_connections(id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_syncs_source_connection ON public.syncs(source_connection_id);
CREATE INDEX IF NOT EXISTS idx_syncs_destination_connection ON public.syncs(destination_connection_id);

-- Add RLS policies for the new columns
ALTER TABLE public.syncs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own syncs"
  ON public.syncs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.integration_connections WHERE id = source_connection_id
      UNION
      SELECT user_id FROM public.integration_connections WHERE id = destination_connection_id
    )
  );

CREATE POLICY "Users can create their own syncs"
  ON public.syncs
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.integration_connections WHERE id = source_connection_id
      UNION
      SELECT user_id FROM public.integration_connections WHERE id = destination_connection_id
    )
  );

CREATE POLICY "Users can update their own syncs"
  ON public.syncs
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.integration_connections WHERE id = source_connection_id
      UNION
      SELECT user_id FROM public.integration_connections WHERE id = destination_connection_id
    )
  );

CREATE POLICY "Users can delete their own syncs"
  ON public.syncs
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.integration_connections WHERE id = source_connection_id
      UNION
      SELECT user_id FROM public.integration_connections WHERE id = destination_connection_id
    )
  ); 