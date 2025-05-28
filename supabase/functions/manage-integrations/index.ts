import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, ApiKey"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify service role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the token is a service role token
    const { data: { role }, error: authError } = await supabaseClient.auth.getUser(authHeader.split(' ')[1]);
    if (authError || role !== 'service_role') {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (req.method) {
      case 'GET':
        if (path === 'list') {
          const { data, error } = await supabaseClient
            .from('integrations')
            .select('*');
          
          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;

      case 'POST':
        if (path === 'create') {
          const body = await req.json();
          const { data, error } = await supabaseClient
            .from('integrations')
            .insert([{
              name: body.name,
              description: body.description,
              icon: body.icon,
              auth_type: body.auth_type,
              category: body.category,
              client_id: body.client_id,
              client_secret: body.client_secret,
              auth_url: body.auth_url,
              token_url: body.token_url,
              scopes: body.scopes,
              required_parameters: body.required_parameters
            }])
            .select()
            .single();

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;

      case 'PUT':
        if (path === 'update') {
          const body = await req.json();
          const { id, ...updates } = body;
          
          const { data, error } = await supabaseClient
            .from('integrations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;

      case 'DELETE':
        if (path === 'delete') {
          const { id } = await req.json();
          const { error } = await supabaseClient
            .from('integrations')
            .delete()
            .eq('id', id);

          if (error) throw error;
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;
    }

    throw new Error('Invalid endpoint');
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 400
      }
    );
  }
}); 