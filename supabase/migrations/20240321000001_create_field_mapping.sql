-- Create enum for sync direction
CREATE TYPE sync_direction AS ENUM ('one-way', 'two-way');
CREATE TYPE conflict_resolution AS ENUM ('source', 'destination', 'latest');

-- Create syncs table
CREATE TABLE syncs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    source_integration_id UUID REFERENCES integrations(id),
    destination_integration_id UUID REFERENCES integrations(id),
    entity_type VARCHAR(255) NOT NULL,
    sync_direction sync_direction NOT NULL DEFAULT 'one-way',
    conflict_resolution conflict_resolution NOT NULL DEFAULT 'latest',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create field mappings table
CREATE TABLE field_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_id UUID REFERENCES syncs(id) ON DELETE CASCADE,
    source_field_name VARCHAR(255) NOT NULL,
    source_field_type VARCHAR(50) NOT NULL,
    destination_field_name VARCHAR(255) NOT NULL,
    destination_field_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON syncs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON field_mappings FOR SELECT USING (true);
