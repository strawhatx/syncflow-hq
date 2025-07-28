import { supabase } from '../config/supabase';

export type TableProperty = 
'config->>table_id' | 
'config->>table_name' | 
'config->>database_id'| 
'config->>sheet_id' |
'config->>sheet_name';

export const getConnectionTableByTableId = async (tableId: string, tableProperty: TableProperty) => {
  const { data, error } = await supabase
    .from('connection_tables')
    .select(`*`)
    .eq(tableProperty, tableId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}