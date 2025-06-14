-- Remove team_id from connectors table since it should be a global lookup table
ALTER TABLE connectors DROP COLUMN team_id;

-- Add a comment to explain the table's purpose
COMMENT ON TABLE connectors IS 'Global lookup table for available integration types and their base configurations'; 