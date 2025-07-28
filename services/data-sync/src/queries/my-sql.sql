-- Create log table if not exists
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
DELIMITER ;
