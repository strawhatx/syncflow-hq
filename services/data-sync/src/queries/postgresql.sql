-- Enable http extension (run once per DB)
CREATE EXTENSION IF NOT EXISTS http;

-- Create the trigger function (run once per DB)
CREATE OR REPLACE FUNCTION notify_syncflow_webhook()
RETURNS trigger AS $$
DECLARE
  payload json;
BEGIN
  payload := json_build_object(
    'table', TG_TABLE_NAME,
    'operation', TG_OP,
    'record', row_to_json(NEW),
    'old_record', row_to_json(OLD)
  );
  PERFORM http_post(
    '{webhook_url}/webhooks/supabase',
    payload::text,
    'application/json'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- For each table, drop and create the trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'syncflow_notify_trigger_{table}'
  ) THEN
    EXECUTE format('
      CREATE TRIGGER syncflow_notify_trigger_{table}
      AFTER INSERT OR UPDATE OR DELETE ON {table}
      FOR EACH ROW EXECUTE FUNCTION notify_syncflow_webhook();
    ');
  END IF;
END;
$$;
