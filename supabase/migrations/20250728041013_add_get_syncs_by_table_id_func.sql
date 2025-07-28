-- Add function to get syncs by table id in any mapping
CREATE OR REPLACE FUNCTION public.get_syncs_by_table_id(table_id text)
RETURNS SETOF syncs
LANGUAGE sql
AS $$
  SELECT *
  FROM syncs
  WHERE EXISTS (
    SELECT 1
    FROM jsonb_array_elements(config->'schema'->'table_mappings') AS mapping
    WHERE mapping->>'source_table_id' = table_id
       OR mapping->>'destination_table_id' = table_id
  );
$$;
