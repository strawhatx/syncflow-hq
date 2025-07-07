import { supabase } from "../config/supabase";

// ✅ Get the connection config from the database
export const getConnectionConfig = async (connection_id: string) => {
    const { data, error } = await supabase
      .from('connections')
      .select('config')
      .eq('id', connection_id)
      .single();
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data.config;
  }