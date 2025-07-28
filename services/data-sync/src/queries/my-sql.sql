-- Create a log table
CREATE TABLE SyncflowChangeLog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(255),
  operation VARCHAR(10),
  record JSON,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger for INSERT
DELIMITER $$
CREATE TRIGGER trg_SyncflowChangeLog_INSERT
AFTER INSERT ON your_table
FOR EACH ROW
BEGIN
  INSERT INTO SyncflowChangeLog (table_name, operation, record)
  VALUES ('your_table', 'INSERT', JSON_OBJECT('record', NEW.*));
END$$
DELIMITER ;

-- Create a trigger for UPDATE
DELIMITER $$
CREATE TRIGGER trg_SyncflowChangeLog_UPDATE
AFTER UPDATE ON your_table
FOR EACH ROW
BEGIN
  INSERT INTO SyncflowChangeLog (table_name, operation, record)
  VALUES ('your_table', 'UPDATE', JSON_OBJECT('record', NEW.*));
END$$
DELIMITER ;

-- Create a trigger for DELETE
DELIMITER $$
CREATE TRIGGER trg_SyncflowChangeLog_DELETE
AFTER DELETE ON your_table
FOR EACH ROW
BEGIN
  INSERT INTO SyncflowChangeLog (table_name, operation, record)
  VALUES ('your_table', 'DELETE', JSON_OBJECT('record', OLD.*));
END$$
DELIMITER ;
