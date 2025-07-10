-- Function to insert a new job
CREATE OR REPLACE FUNCTION insert_metadata_sync_job(
    p_connection_id UUID,
    p_team_id UUID,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    new_job_id UUID;
BEGIN
    -- Check if the user is a member of the team
    IF EXISTS (
        SELECT 1 FROM public.team_members
        WHERE user_id = p_user_id
        AND team_id = p_team_id
    ) THEN
        -- Insert the new job
        INSERT INTO public.metadata_sync_jobs (connection_id, team_id, status, created_at, updated_at)
        VALUES (p_connection_id, p_team_id, 'pending', NOW(), NOW())
        RETURNING id INTO new_job_id;
    ELSE
        RAISE EXCEPTION 'User is not a member of the team';
    END IF;

    RETURN new_job_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION insert_metadata_sync_job(UUID, UUID, UUID) TO authenticated