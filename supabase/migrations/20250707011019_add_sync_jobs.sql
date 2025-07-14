-- Metadata sync jobs
CREATE TABLE public.metadata_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    connection_id UUID NOT NULL REFERENCES public.connections (id),
    team_id UUID NOT NULL REFERENCES public.teams (id),
    status TEXT NOT NULL DEFAULT 'pending',
    progress INT DEFAULT 0,
    started_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data sync jobs
CREATE TABLE public.data_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    sync_id UUID NOT NULL REFERENCES public.syncs (id),
    team_id UUID NOT NULL REFERENCES public.teams (id),
    status TEXT NOT NULL DEFAULT 'pending',
    progress INT DEFAULT 0,
    last_synced_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index to quickly find jobs by status (for workers)
CREATE INDEX idx_data_sync_jobs_status ON public.data_sync_jobs (status);
CREATE INDEX idx_metadata_sync_jobs_status ON public.metadata_sync_jobs (status);

CREATE INDEX idx_data_sync_jobs_sync_id ON public.data_sync_jobs (sync_id);
CREATE INDEX idx_metadata_sync_jobs_connection_id ON public.metadata_sync_jobs (connection_id);

CREATE INDEX idx_data_sync_jobs_team_id ON public.data_sync_jobs (team_id);
CREATE INDEX idx_metadata_sync_jobs_team_id ON public.metadata_sync_jobs (team_id);

-- Enable RLS for sync_jobs
ALTER TABLE public.metadata_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sync_jobs ENABLE ROW LEVEL SECURITY;

-- Policy to allow insets by team members as long as they are authenticated
CREATE POLICY "Team members can insert their own metadata sync jobs"
    ON public.metadata_sync_jobs
    FOR INSERT
    WITH CHECK (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

CREATE POLICY "Team members can insert their own data sync jobs"
    ON public.data_sync_jobs
    FOR INSERT
    WITH CHECK (
        team_id = ANY(public.get_team_ids_for_user(auth.uid()))
    );

-- Optional: Trigger to update updated_at on row update for data_sync_jobs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_update_data_sync_jobs_updated_at
BEFORE UPDATE ON public.data_sync_jobs
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to notify when a new job is inserted
CREATE OR REPLACE FUNCTION notify_new_job()
RETURNS TRIGGER AS $$
BEGIN
   -- Notify with the job details, including the table name
   IF NEW.status = 'pending' THEN
       PERFORM pg_notify('new_job', json_build_object('table', TG_TABLE_NAME, 'id', NEW.id)::text);
   END IF;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for metadata_sync_jobs
CREATE TRIGGER trg_notify_new_metadata_job
AFTER INSERT ON public.metadata_sync_jobs
FOR EACH ROW EXECUTE PROCEDURE notify_new_job();

-- Trigger for data_sync_jobs
CREATE TRIGGER trg_notify_new_data_job
AFTER INSERT ON public.data_sync_jobs
FOR EACH ROW EXECUTE PROCEDURE notify_new_job();