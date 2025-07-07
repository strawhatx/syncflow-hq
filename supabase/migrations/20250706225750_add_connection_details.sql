-- Add last_sync column to connections table
ALTER TABLE public.connections
ADD COLUMN last_sync TIMESTAMPTZ DEFAULT NULL;

-- Create databases table
CREATE TABLE public.connection_databases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, connection_id) -- Ensure unique database names per connector
);

-- Create tables table
CREATE TABLE public.connection_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    database_id UUID REFERENCES public.connection_databases(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, database_id) -- Ensure unique table names per database
);


-- Create columns table
CREATE TABLE public.connection_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    table_id UUID REFERENCES public.connection_tables(id) ON DELETE CASCADE,
    data_type TEXT NOT NULL,
    is_nullable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, table_id) -- Ensure unique column names per table
);

-- Index for performance
CREATE INDEX idx_databases_connection_id ON public.connection_databases(connection_id);
CREATE INDEX idx_tables_database_id ON public.connection_tables(database_id);
CREATE INDEX idx_columns_table_id ON public.connection_columns(table_id);