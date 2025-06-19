-- Drop role column from team_invites if it exists
ALTER TABLE IF EXISTS team_invites DROP COLUMN IF EXISTS role;

-- Drop email column from team_members if it exists
ALTER TABLE IF EXISTS team_members DROP COLUMN IF EXISTS email;

-- Create team_invites table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    UNIQUE(team_id, email)
);

CREATE OR REPLACE FUNCTION public.get_owned_or_admin_team_ids_for_user(uid UUID)
RETURNS UUID[] AS $$
    SELECT ARRAY(
        SELECT team_id
        FROM public.team_members
        WHERE user_id = uid
          AND role IN ('owner', 'admin')
          AND status = 'active'
    );
$$ LANGUAGE plpgsql
SET search_path = public;

-- Add RLS policies for team_invites
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Allow team owners and admins to update invites
CREATE POLICY "Team members can view invites"
    ON team_invites FOR SELECT
    TO authenticated
    USING (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );


-- Allow team owners and admins to create invites
CREATE POLICY "Team owners and admins can create invites"
    ON team_invites FOR INSERT
    TO authenticated
    WITH CHECK (
        team_id = ANY(public.get_owned_or_admin_team_ids_for_user(auth.uid()))
    );

-- Allow team owners and admins to update invites
CREATE POLICY "Team owners and admins can update invites"
    ON team_invites FOR UPDATE
    TO authenticated
    USING (
        team_id = ANY(public.get_owned_or_admin_team_ids_for_user(auth.uid()))
    );

-- Allow team owners and admins to delete invites
CREATE POLICY "Team owners and admins can delete invites"
    ON team_invites FOR DELETE
    TO authenticated
    USING (
       team_id = ANY(public.get_owned_or_admin_team_ids_for_user(auth.uid()))
    );

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Create trigger for team_invites
CREATE TRIGGER update_team_invites_updated_at
    BEFORE UPDATE ON team_invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 