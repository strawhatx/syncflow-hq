
-- Create a table for all available integrations
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  auth_type TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- This table will be public (no RLS needed as it's reference data)
-- Let's add some initial integrations data
INSERT INTO public.integrations (name, description, icon, auth_type, category) VALUES
('Shopify', 'Connect your Shopify store to sync products, orders, and customers', 'https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png', 'oauth', 'commerce'),
('Airtable', 'Use Airtable as a powerful database for your e-commerce data', 'https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png', 'api_key', 'database'),
('Notion', 'Organize your e-commerce operations in Notion databases and pages', 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png', 'oauth', 'productivity'),
('Klaviyo', 'Sync customer data with Klaviyo for better email marketing', 'https://cdn.worldvectorlogo.com/logos/klaviyo-1.svg', 'api_key', 'marketing'),
('WooCommerce', 'Sync your WooCommerce store data to other applications', 'https://cdn.worldvectorlogo.com/logos/woocommerce.svg', 'oauth', 'commerce'),
('Google Sheets', 'Use Google Sheets to store and manage your e-commerce data', 'https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg', 'oauth', 'database'),
('Mailchimp', 'Keep customer data in sync with your Mailchimp lists', 'https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon.svg', 'api_key', 'marketing');
