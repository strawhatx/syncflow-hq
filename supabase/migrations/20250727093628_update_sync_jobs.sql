ALTER TABLE public.data_sync_jobs ADD COLUMN payload JSONB;
ALTER TABLE data_sync_jobs ADD COLUMN provider TEXT NOT NULL;
