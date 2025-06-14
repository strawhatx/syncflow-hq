import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Connection = Database['public']['Tables']['connections']['Row'];

export const fetchConnectionById = async (id: string): Promise<Connection | null> => {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateConnectionStatus = async (id: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from('connections')
    .update({ is_active: isActive })
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteConnection = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}; 