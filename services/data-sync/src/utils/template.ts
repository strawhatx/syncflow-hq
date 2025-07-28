/**
 * Safely replaces placeholders in SQL templates
 * @param template The SQL template with placeholders like {table}, {webhook_url}
 * @param vars Object containing the values to replace
 * @returns The SQL with placeholders replaced
 */
export function fillTemplate(template: string, vars: Record<string, string>): string {
  // Basic SQL injection prevention - only allow alphanumeric, underscore, and dot for table names
  const sanitizeTableName = (name: string): string => {
    if (!/^[a-zA-Z0-9_.]+$/.test(name)) {
      throw new Error(`Invalid table name: ${name}. Only alphanumeric, underscore, and dot characters are allowed.`);
    }
    return name;
  };

  // Sanitize webhook URL
  const sanitizeUrl = (url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error(`Invalid webhook URL: ${url}. Must start with http:// or https://`);
    }
    return url;
  };

  return template.replace(/{(\w+)}/g, (match, key) => {
    const value = vars[key];
    if (value === undefined) {
      throw new Error(`Missing required template variable: ${key}`);
    }

    // Apply sanitization based on the variable type
    switch (key) {
      case 'table':
        return sanitizeTableName(value);
      case 'webhook_url':
        return sanitizeUrl(value);
      default:
        // For other variables, just escape single quotes to prevent SQL injection
        return value.replace(/'/g, "''");
    }
  });
}

/**
 * Loads a SQL template from the queries directory
 * @param provider The database provider (postgresql, sql-server, my-sql)
 * @returns The SQL template content
 */
export function loadSqlTemplate(provider: string): string {
  try {
    // In a real implementation, you'd read from the file system
    // For now, we'll return the templates as strings
    const templates: Record<string, string> = {
      'postgresql': `-- Enable http extension (run once per DB)
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
$$;`,

      'sql-server': `-- Create log table if not exists
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SyncflowChangeLog' AND xtype='U')
CREATE TABLE SyncflowChangeLog (
  id INT IDENTITY PRIMARY KEY,
  table_name NVARCHAR(255),
  operation NVARCHAR(10),
  record NVARCHAR(MAX),
  changed_at DATETIME DEFAULT GETDATE()
);

-- For each table, create trigger if not exists
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_SyncflowChangeLog_{table}')
EXEC('
  CREATE TRIGGER trg_SyncflowChangeLog_{table}
  ON {table}
  AFTER INSERT, UPDATE, DELETE
  AS
  BEGIN
    SET NOCOUNT ON;
    INSERT INTO SyncflowChangeLog (table_name, operation, record)
    SELECT ''{table}'', ''INSERT'', (SELECT * FROM inserted FOR JSON PATH) FROM inserted;
    INSERT INTO SyncflowChangeLog (table_name, operation, record)
    SELECT ''{table}'', ''DELETE'', (SELECT * FROM deleted FOR JSON PATH) FROM deleted;
  END
');`,

      'my-sql': `-- Create log table if not exists
CREATE TABLE IF NOT EXISTS SyncflowChangeLog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(255),
  operation VARCHAR(10),
  record JSON,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger for INSERT
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS trg_SyncflowChangeLog_INSERT_{table}
AFTER INSERT ON {table}
FOR EACH ROW
BEGIN
  INSERT INTO SyncflowChangeLog (table_name, operation, record)
  VALUES ('{table}', 'INSERT', JSON_OBJECT('record', NEW.*));
END$$
DELIMITER ;

-- Create a trigger for UPDATE
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS trg_SyncflowChangeLog_UPDATE_{table}
AFTER UPDATE ON {table}
FOR EACH ROW
BEGIN
  INSERT INTO SyncflowChangeLog (table_name, operation, record)
  VALUES ('{table}', 'UPDATE', JSON_OBJECT('record', NEW.*));
END$$
DELIMITER ;

-- Create a trigger for DELETE
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS trg_SyncflowChangeLog_DELETE_{table}
AFTER DELETE ON {table}
FOR EACH ROW
BEGIN
  INSERT INTO SyncflowChangeLog (table_name, operation, record)
  VALUES ('{table}', 'DELETE', JSON_OBJECT('record', OLD.*));
END$$
DELIMITER ;`
    };

    const template = templates[provider];
    if (!template) {
      throw new Error(`No SQL template found for provider: ${provider}`);
    }

    return template;
  } catch (error) {
    throw new Error(`Failed to load SQL template for ${provider}: ${error}`);
  }
} 