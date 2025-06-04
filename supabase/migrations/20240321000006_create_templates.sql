-- Create templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_integration_id UUID NOT NULL REFERENCES integrations(id),
  destination_integration_id UUID NOT NULL REFERENCES integrations(id),
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('one-way', 'two-way')),
  matching_key TEXT NOT NULL,
  field_mappings JSONB,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Allow users to view all templates
CREATE POLICY "Allow users to view all templates"
  ON templates FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 