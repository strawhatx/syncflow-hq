-- Create template categories table
CREATE TABLE template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO template_categories (name, description) VALUES
  ('product', 'Product and inventory related templates'),
  ('order', 'Order and fulfillment related templates'),
  ('customer', 'Customer and contact related templates'),
  ('collection', 'Product collection and category templates'),
  ('inventory', 'Inventory and stock management templates'),
  ('marketing', 'Marketing and campaign related templates');

-- Add category_id to templates table
ALTER TABLE templates 
ADD COLUMN category_id UUID REFERENCES template_categories(id);

-- Add RLS policies for template_categories
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

-- Allow users to view all categories
CREATE POLICY "Allow users to view all template categories"
  ON template_categories FOR SELECT
  USING (true);

-- Only allow admins to modify categories
CREATE POLICY "Allow admins to modify template categories"
  ON template_categories FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin'); 