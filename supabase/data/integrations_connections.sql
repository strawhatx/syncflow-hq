
-- Create a table for integration connections
CREATE TABLE public.integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  integration_id UUID REFERENCES public.integrations NOT NULL,
  connection_name TEXT NOT NULL,
  connection_status TEXT NOT NULL,
  api_key TEXT,
  auth_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access to connections
CREATE POLICY "Users can view their own connections" 
  ON public.integration_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections" 
  ON public.integration_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" 
  ON public.integration_connections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" 
  ON public.integration_connections 
  FOR DELETE 
  USING (auth.uid() = user_id);
