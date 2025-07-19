-- Drop existing tables and related objects
DROP TABLE IF EXISTS public.syncs CASCADE;
DROP TABLE IF EXISTS public.integrations CASCADE;
DROP TABLE IF EXISTS public.connectors CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.field_mapping CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;

-- Drop any related types
DROP TYPE IF EXISTS public.integration_type;
DROP TYPE IF EXISTS public.integration_provider;
DROP TYPE IF EXISTS public.setup_stage;

-- Create teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create connectors table
CREATE TABLE public.connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('api_key', 'oauth')),
    provider TEXT NOT NULL,
    config JSONB NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create connections table
CREATE TABLE public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id UUID REFERENCES public.connectors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config JSONB NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create syncs table
CREATE TABLE public.syncs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    source_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
    config JSONB NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    setup_stage TEXT NOT NULL DEFAULT 'apps',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create field_mapping table
CREATE TABLE public.field_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_id UUID REFERENCES public.syncs(id) ON DELETE CASCADE,
    source_field TEXT NOT NULL,
    destination_field TEXT NOT NULL,
    transformation_type TEXT CHECK (transformation_type IN ('direct', 'transform', 'constant')),
    transformation_config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create functions
CREATE OR REPLACE FUNCTION public.get_team_ids_for_user(uid uuid)
RETURNS uuid[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT team_id
        FROM public.team_members
        WHERE user_id = uid
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_role_based_team_ids_for_user(uid UUID, role TEXT)
RETURNS UUID[] AS $$
    SELECT ARRAY(
        SELECT team_id
        FROM public.team_members
        WHERE user_id = uid
          AND role = role
          AND status = 'active'
    );
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_accessible_sync_ids_for_user(uid UUID)
RETURNS UUID[] AS $$
    SELECT ARRAY(
        SELECT s.id
        FROM public.syncs s
        WHERE s.team_id = ANY(public.get_team_ids_for_user(uid))
    );
$$ LANGUAGE plpgsql
SET search_path = public;

-- Create view for team members
CREATE OR REPLACE VIEW public.view_team_members AS
SELECT
  tm.*,
  p.username,
  p.avatar_url,
  u.email
FROM public.team_members tm
LEFT JOIN public.profiles p ON tm.user_id = p.id
LEFT JOIN auth.users u ON p.id = u.id;

-- Create indexes
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_connectors_team_id ON public.connectors(team_id);
CREATE INDEX idx_connectors_type ON public.connectors(type);
CREATE INDEX idx_connectors_provider ON public.connectors(provider);
CREATE INDEX idx_connections_team_id ON public.connections(team_id);
CREATE INDEX idx_connections_connector_id ON public.connections(connector_id);
CREATE INDEX idx_syncs_team_id ON public.syncs(team_id);
CREATE INDEX idx_syncs_source_id ON public.syncs(source_id);
CREATE INDEX idx_syncs_destination_id ON public.syncs(destination_id);
CREATE INDEX idx_field_mapping_sync_id ON public.field_mapping(sync_id);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_mapping ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view their teams"
    ON public.teams
    FOR SELECT
    USING (
        id = ANY(public.get_team_ids_for_user(auth.uid()))
        OR created_by = auth.uid()
    );

CREATE POLICY "Authenticated users can create teams"
    ON public.teams
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Team owners can update their teams"
    ON public.teams
    FOR UPDATE
    USING (
        id = ANY(public.get_role_based_team_ids_for_user(auth.uid(), 'owner'))
    );

-- Team members policies
-- Users can view their team members
CREATE POLICY "Users can only view their own member"
    ON public.team_members
    FOR SELECT
    USING (
         (select auth.uid()) = user_id
    );

    -- Team owners can create team members
CREATE POLICY "Users can create team members"
    ON public.team_members
    FOR INSERT
        TO authenticated
    WITH CHECK (true);

-- Team owners can update team members
CREATE POLICY "Team owners can update team members"
    ON public.team_members
    FOR UPDATE
    USING (
        team_id IN (
        SELECT team_id
        FROM public.team_members
        WHERE user_id = auth.uid()
          AND role = 'owner'
          AND status = 'active'
    )
    );

CREATE POLICY "Team owners can delete team members"
    ON public.team_members
    FOR DELETE
    USING (
        team_id IN (
        SELECT team_id
        FROM public.team_members
        WHERE user_id = auth.uid()
          AND role = 'owner'
          AND status = 'active'
    )
    );

-- Users can remove themselves
CREATE POLICY "Users can remove themselves"
    ON public.team_members
    FOR DELETE
    USING (
        user_id = auth.uid()
    );

-- Connectors policies
CREATE POLICY "Anyone can view connectors"
    ON public.connectors
    FOR SELECT
    USING (true);

-- Connections policies
CREATE POLICY "Team members can view their team's connections"
    ON public.connections
    FOR SELECT
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

CREATE POLICY "Team members can create their team's connections"
    ON public.connections
    FOR INSERT
    WITH CHECK (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

    CREATE POLICY "Team members can update their team's connections"
    ON public.connections
    FOR UPDATE
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

CREATE POLICY "Team members can delete their team's connections"
    ON public.connections
    FOR DELETE
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

-- Syncs policies
CREATE POLICY "Team members can view their team's syncs"
    ON public.syncs
    FOR SELECT
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

CREATE POLICY "Team members can create their team's syncs"
    ON public.syncs
    FOR INSERT
    WITH CHECK (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

CREATE POLICY "Team members can update their team's syncs"
    ON public.syncs
    FOR UPDATE
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

CREATE POLICY "Team members can delete their team's syncs"
    ON public.syncs
    FOR DELETE
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

-- Field mapping policies
CREATE POLICY "Team members can view their team's field mappings"
    ON public.field_mapping
    FOR SELECT
     USING (
        sync_id = ANY(public.get_accessible_sync_ids_for_user(auth.uid()))
    );

CREATE POLICY "Team members can manage their team's field mappings"
    ON public.field_mapping
    FOR INSERT
    WITH CHECK (
        sync_id = ANY(public.get_accessible_sync_ids_for_user(auth.uid()))
    );

CREATE POLICY "Team members can update their team's field mappings"
    ON public.field_mapping
    FOR UPDATE
    USING (
        sync_id = ANY(public.get_accessible_sync_ids_for_user(auth.uid()))
    );

CREATE POLICY "Team members can delete their team's field mappings"
    ON public.field_mapping
    FOR DELETE
    USING (
        sync_id = ANY(public.get_accessible_sync_ids_for_user(auth.uid()))
    );