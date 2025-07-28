-- Create a log table
CREATE TABLE SyncflowChangeLog (
  id INT IDENTITY PRIMARY KEY,
  table_name NVARCHAR(255),
  operation NVARCHAR(10),
  record NVARCHAR(MAX),
  changed_at DATETIME DEFAULT GETDATE()
);

-- Create a trigger on your table (replace 'your_table' with the actual table name)
CREATE TRIGGER trg_SyncflowChangeLog
ON your_table
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;

  -- For INSERTED rows
  INSERT INTO SyncflowChangeLog (table_name, operation, record)
  SELECT 'your_table', 'INSERT', (SELECT * FROM inserted FOR JSON PATH)
  FROM inserted;

  -- For DELETED rows
  INSERT INTO SyncflowChangeLog (table_name, operation, record)
  SELECT 'your_table', 'DELETE', (SELECT * FROM deleted FOR JSON PATH)
  FROM deleted;
END;
