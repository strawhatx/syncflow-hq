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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES profiles(id)
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

-- Enable RLS
ALTER TABLE syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies for syncs
CREATE POLICY "Users can view their own syncs"
    ON syncs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own syncs"
    ON syncs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own syncs"
    ON syncs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own syncs"
    ON syncs FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for field mappings
CREATE POLICY "Users can view field mappings for their syncs"
    ON field_mappings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM syncs
            WHERE syncs.id = field_mappings.sync_id
            AND syncs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create field mappings for their syncs"
    ON field_mappings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM syncs
            WHERE syncs.id = field_mappings.sync_id
            AND syncs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update field mappings for their syncs"
    ON field_mappings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM syncs
            WHERE syncs.id = field_mappings.sync_id
            AND syncs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete field mappings for their syncs"
    ON field_mappings FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM syncs
            WHERE syncs.id = field_mappings.sync_id
            AND syncs.user_id = auth.uid()
        )
    );
