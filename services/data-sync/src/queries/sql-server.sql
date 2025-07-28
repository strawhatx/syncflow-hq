-- Create log table if not exists
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
');