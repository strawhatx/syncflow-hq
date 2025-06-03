-- Create a table for all available integrations
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  auth_type TEXT NOT NULL,
  category TEXT NOT NULL,
  client_id TEXT,
  client_secret TEXT,
  auth_url TEXT,
  token_url TEXT,
  redirect_url TEXT,
  scopes TEXT[],
  required_parameters TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- This table will be public (no RLS needed as it's reference data)
-- Let's add some initial integrations data
INSERT INTO public.integrations (
  name, 
  description, 
  icon, 
  auth_type, 
  category,
  auth_url,
  token_url,
  redirect_url,
  scopes,
  required_parameters
) VALUES
(
  'Shopify',
  'Connect your Shopify store to sync products, orders, and customers',
  'shopify-icon',
  'oauth',
  'commerce',
  'https://{shop}.myshopify.com/admin/oauth/authorize',
  'https://{shop}.myshopify.com/admin/oauth/access_token',
  'http://localhost:8080/shopify/callback',
  ARRAY[
    'read_products', 'write_products',
    'read_orders', 'write_orders',
    'read_customers', 'write_customers',
    'read_inventory', 'write_inventory'
  ],
  ARRAY['shop']
),
(
  'Notion',
  'Organize your e-commerce operations in Notion databases and pages',
  'notion-icon',
  'oauth',
  'productivity',
  'https://api.notion.com/v1/oauth/authorize',
  'https://api.notion.com/v1/oauth/token',
  'http://localhost:8080/notion/callback',
  ARRAY[
    'read_user', 'read_blocks', 'write_blocks',
    'read_databases', 'write_databases',
    'read_pages', 'write_pages'
  ],
  NULL
),
(
  'Google Sheets',
  'Use Google Sheets to store and manage your e-commerce data',
  'google_sheets-icon',
  'oauth',
  'database',
  'https://accounts.google.com/o/oauth2/v2/auth',
  'https://oauth2.googleapis.com/token',
  'http://localhost:8080/google_sheets/callback',
  ARRAY[
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ],
  NULL
),
(
  'Airtable',
  'Use Airtable as a powerful database for your e-commerce data',
  'airtable-icon',
  'oauth',
  'database',
  'https://airtable.com/oauth2/v1/authorize',
  'https://airtable.com/oauth2/v1/token',
  'http://localhost:8080/airtable/callback',
  ARRAY[
    'data.records:read',
    'data.records:write',
    'schema.bases:read',
    'schema.bases:write'
  ],
  NULL
),
(
  'Klaviyo',
  'Sync customer data with Klaviyo for better email marketing',
  'klaviyo-icon',
  'api_key',
  'marketing',
  'https://www.klaviyo.com/oauth/authorize',
  'https://www.klaviyo.com/oauth/token',
  'http://localhost:8080/klaviyo/callback',
  ARRAY[
    'read-campaigns',
    'write-campaigns',
    'read-lists',
    'write-lists',
    'read-profiles',
    'write-profiles'
  ],
  NULL
),
(
  'Mailchimp',
  'Keep customer data in sync with your Mailchimp lists',
  'mailchimp-icon',
  'api_key',
  'marketing',
  'https://login.mailchimp.com/oauth2/authorize',
  'https://login.mailchimp.com/oauth2/token',
  'http://localhost:8080/mailchimp/callback',
  ARRAY[
    'campaigns_read',
    'campaigns_write',
    'lists_read',
    'lists_write',
    'subscribers_read',
    'subscribers_write'
  ],
  NULL
);

-- Add RLS policies to protect sensitive data
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view integration metadata"
  ON public.integrations
  FOR SELECT
  USING (true);

CREATE POLICY "Only service role can view sensitive data"
  ON public.integrations
  FOR SELECT
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create a view for public access that excludes sensitive data
CREATE OR REPLACE VIEW public.integrations_public AS
SELECT 
  id,
  name,
  description,
  icon,
  auth_type,
  category,
  auth_url,
  token_url,
  redirect_url,
  client_id,
  scopes,
  required_parameters,
  created_at,
  updated_at
FROM public.integrations;
