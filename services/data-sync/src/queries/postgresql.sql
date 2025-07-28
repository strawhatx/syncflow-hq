-- Enable the http extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS http;

-- Create the trigger function
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

  -- POST to your webhook
  PERFORM http_post(
    'https://yourdomain.com/webhooks/supabase',
    payload::text,
    'application/json'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on your table (replace 'your_table' with the actual table name)
DROP TRIGGER IF EXISTS syncflow_notify_trigger ON your_table;
CREATE TRIGGER syncflow_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON your_table
FOR EACH ROW EXECUTE FUNCTION notify_syncflow_webhook();
