-- Insert initial connectors
INSERT INTO public.connectors (name, type, provider, config, is_active)
VALUES
    (
        'Supabase',
        'database',
        'supabase',
        '{
            "required_fields": ["url", "key"],
            "optional_fields": ["schema"],
            "description": "Connect to your Supabase database",
            "icon": "supabase"
        }'::jsonb,
        true
    ),
    (
        'PostgreSQL',
        'database',
        'postgresql',
        '{
            "required_fields": ["host", "port", "database", "username", "password"],
            "optional_fields": ["schema", "ssl"],
            "description": "Connect to your PostgreSQL database",
            "icon": "postgresql"
        }'::jsonb,
        true
    ),
    (
        'MongoDB',
        'database',
        'mongodb',
        '{
            "required_fields": ["uri", "database"],
            "optional_fields": ["options"],
            "description": "Connect to your MongoDB database",
            "icon": "mongodb"
        }'::jsonb,
        true
    ),
    (
        'MySQL',
        'database',
        'mysql',
        '{
            "required_fields": ["host", "port", "database", "username", "password"],
            "optional_fields": ["ssl"],
            "description": "Connect to your MySQL database",
            "icon": "mysql"
        }'::jsonb,
        true
    ),
    (
        'Amazon S3',
        'file',
        'aws',
        '{
            "required_fields": ["bucket", "region", "access_key_id", "secret_access_key"],
            "optional_fields": ["prefix", "endpoint"],
            "description": "Connect to your S3 bucket",
            "icon": "s3"
        }'::jsonb,
        true
    ); 