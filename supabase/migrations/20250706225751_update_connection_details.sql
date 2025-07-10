

-- Add team_id column to connection_databases table
ALTER TABLE public.connection_databases ADD COLUMN team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE;

-- Add team_id column to connection_tables table
ALTER TABLE public.connection_tables ADD COLUMN team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE;

-- Add team_id column to connection_columns table
ALTER TABLE public.connection_columns ADD COLUMN team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE;


-- Enable RLS on connection_databases table
ALTER TABLE public.connection_databases ENABLE ROW LEVEL SECURITY;

-- Enable RLS on connection_tables table
ALTER TABLE public.connection_tables ENABLE ROW LEVEL SECURITY;

-- Enable RLS on connection_columns table
ALTER TABLE public.connection_columns ENABLE ROW LEVEL SECURITY;

-- Example policy for connections table
CREATE POLICY team_members_can_access_connections ON public.connections
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

-- Example policy for connection_databases table
CREATE POLICY team_members_can_access_databases ON public.connection_databases
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

-- Example policy for connection_tables table
CREATE POLICY team_members_can_access_tables ON public.connection_tables
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

-- Example policy for connection_columns table
CREATE POLICY team_members_can_access_columns ON public.connection_columns
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );