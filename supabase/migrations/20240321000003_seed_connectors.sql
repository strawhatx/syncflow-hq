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
            "auth_url": "https://api.supabase.com/v1/oauth/authorize",
            "token_url": "https://api.supabase.com/v1/oauth/token",
            "scopes": ["projects.read", "projects.write"],
            "required_parameters": [],
            "redirect_url": "http://localhost:3000/supabase/callback",
            "code_challenge_required": false
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
            "scopes": [
                "data.records:read",
                "data.records:write",
                "schema.bases:read",
                "schema.bases:write"
            ],
            "required_parameters": [],
            "redirect_url": "http://localhost:3000/airtable/callback",
            "code_challenge_required": true
        }'::jsonb,
        true
    ),
    (
        'Google Sheets',
        'oauth',
        'google_sheets',
        '{
            "description": "Connect and sync with your Google Sheets data",
            "icon": "google_sheets-icon",
            "client_id": "your-google-client-id",
            "client_secret": "your-google-client-secret",
            "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
            "token_url": "https://oauth2.googleapis.com/token",
            "scopes": [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive.readonly"
            ],
            "required_parameters": [],
            "redirect_url": "http://localhost:3000/google_sheets/callback",
            "code_challenge_required": true
        }'::jsonb,
        true
    ),
    (
        'Notion',
        'oauth',
        'notion',
        '{
            "description": "Connect to your Notion workspace and sync databases",
            "icon": "notion-icon",
            "client_id": "your-notion-client-id",
            "client_secret": "your-notion-client-secret",
            "auth_url": "https://api.notion.com/v1/oauth/authorize",
            "token_url": "https://api.notion.com/v1/oauth/token",
            "scopes": [
                "database.read",
                "database.write"
            ],
            "required_parameters": [],
            "redirect_url": "http://localhost:3000/notion/callback",
            "code_challenge_required": false
        }'::jsonb,
        true
    ),
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
        false
    );