-- Add unique constraint to prevent duplicate connection names per team per connector
ALTER TABLE public.connections 
ADD CONSTRAINT connections_team_connector_name_unique 
UNIQUE (team_id, connector_id, name);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT connections_team_connector_name_unique ON public.connections 
IS 'Ensures connection names are unique within a team for a given connector'; 