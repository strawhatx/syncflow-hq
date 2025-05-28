-- Add OAuth configuration fields to integrations table
ALTER TABLE public.integrations
ADD COLUMN IF NOT EXISTS client_id TEXT,
ADD COLUMN IF NOT EXISTS client_secret TEXT,
ADD COLUMN IF NOT EXISTS auth_url TEXT,
ADD COLUMN IF NOT EXISTS token_url TEXT,
ADD COLUMN IF NOT EXISTS scopes TEXT[],
ADD COLUMN IF NOT EXISTS required_parameters TEXT[];

-- Update existing OAuth integrations with their configurations
UPDATE public.integrations
SET 
  client_id = CASE 
    WHEN name = 'Shopify' THEN current_setting('app.settings.shopify_client_id', true)
    WHEN name = 'Notion' THEN current_setting('app.settings.notion_client_id', true)
    WHEN name = 'WooCommerce' THEN current_setting('app.settings.woocommerce_client_id', true)
    WHEN name = 'Google Sheets' THEN current_setting('app.settings.google_client_id', true)
  END,
  client_secret = CASE 
    WHEN name = 'Shopify' THEN current_setting('app.settings.shopify_client_secret', true)
    WHEN name = 'Notion' THEN current_setting('app.settings.notion_client_secret', true)
    WHEN name = 'WooCommerce' THEN current_setting('app.settings.woocommerce_client_secret', true)
    WHEN name = 'Google Sheets' THEN current_setting('app.settings.google_client_secret', true)
  END,
  auth_url = CASE 
    WHEN name = 'Shopify' THEN 'https://{shop}.myshopify.com/admin/oauth/authorize'
    WHEN name = 'Notion' THEN 'https://api.notion.com/v1/oauth/authorize'
    WHEN name = 'WooCommerce' THEN 'https://{domain}/wp-json/wc/v3/oauth/authorize'
    WHEN name = 'Google Sheets' THEN 'https://accounts.google.com/o/oauth2/v2/auth'
  END,
  token_url = CASE 
    WHEN name = 'Shopify' THEN 'https://{shop}.myshopify.com/admin/oauth/access_token'
    WHEN name = 'Notion' THEN 'https://api.notion.com/v1/oauth/token'
    WHEN name = 'WooCommerce' THEN 'https://{domain}/wp-json/wc/v3/oauth/token'
    WHEN name = 'Google Sheets' THEN 'https://oauth2.googleapis.com/token'
  END,
  scopes = CASE 
    WHEN name = 'Shopify' THEN ARRAY[
      'read_products', 'write_products',
      'read_orders', 'write_orders',
      'read_customers', 'write_customers',
      'read_inventory', 'write_inventory'
    ]
    WHEN name = 'Notion' THEN ARRAY[
      'read_user', 'read_blocks', 'write_blocks',
      'read_databases', 'write_databases',
      'read_pages', 'write_pages'
    ]
    WHEN name = 'WooCommerce' THEN ARRAY[
      'read', 'write'
    ]
    WHEN name = 'Google Sheets' THEN ARRAY[
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
  END,
  required_parameters = CASE 
    WHEN name = 'Shopify' THEN ARRAY['shop']
    WHEN name = 'WooCommerce' THEN ARRAY['domain']
    ELSE NULL
  END
WHERE auth_type = 'oauth';

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
  scopes,
  required_parameters,
  created_at,
  updated_at
FROM public.integrations; 