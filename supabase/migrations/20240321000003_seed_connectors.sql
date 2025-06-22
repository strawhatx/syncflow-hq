-- Insert initial connectors
INSERT INTO public.connectors (name, type, provider, config, is_active)
VALUES
    (
        'Supabase',
        'oauth',
        'supabase',
        '{
            "description": "Use Supabase as a powerful database for your e-commerce data",
            "icon": "supabase-icon",
            "client_id": "supabase",
            "client_secret": "supabase",
            "auth_url": "https://supabase.com/oauth2/v1/authorize",
            "token_url": "https://supabase.com/oauth2/v1/token",
            "scopes": ["base"],
            "required_parameters": ["base_id"],
            "redirect_url": "http://localhost:8080/oauth/airtable/callback"
        }'::jsonb,
        true
    ),
    (
        'Airtable',
        'oauth',
        'airtable',
        '{
            "description": "Use Airtable as a powerful database for your e-commerce data",
            "icon": "airtable-icon",
            "client_id": "airtable",
            "client_secret": "airtable",
            "auth_url": "https://airtable.com/oauth2/v1/authorize",
            "token_url": "https://airtable.com/oauth2/v1/token",
            "scopes": ["base"],
            "required_parameters": ["base_id"],
            "redirect_url": "http://localhost:8080/oauth/airtable/callback"
        }'::jsonb,
        true
    )
    (
        'PostgreSQL',
        'api_key',
        'postgresql',
        '{
            "required_fields": ["host", "port", "database", "username", "password"],
            "optional_fields": ["schema", "ssl"],
            "description": "Connect to your PostgreSQL database",
            "icon": "postgresql-icon"
        }'::jsonb,
        true
    ),
    (
        'MongoDB',
        'api_key',
        'mongodb',
        '{
            "required_fields": ["uri", "database"],
            "optional_fields": ["options"],
            "description": "Connect to your MongoDB database",
            "icon": "mongodb-icon"
        }'::jsonb,
        true
    ),
    (
        'MySQL',
        'api_key',
        'mysql',
        '{
            "required_fields": ["host", "port", "database", "username", "password"],
            "optional_fields": ["ssl"],
            "description": "Connect to your MySQL database",
            "icon": "mysql-icon"
        }'::jsonb,
        true
    ),
    (
        'Amazon S3',
        'api_key',
        'aws',
        '{
            "required_fields": ["bucket", "region", "access_key_id", "secret_access_key"],
            "optional_fields": ["prefix", "endpoint"],
            "description": "Connect to your S3 bucket",
            "icon": "amazon-s3-icon"
        }'::jsonb,
        true
    ); 