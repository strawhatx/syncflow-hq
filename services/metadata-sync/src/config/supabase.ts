import { createClient } from '@supabase/supabase-js';

if (process.env.NODE_ENV !== 'production') {
    // Load .env only in dev or offline mode
    import('dotenv/config');
  }

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(
    supabaseUrl,
    supabaseServiceRoleKey
);