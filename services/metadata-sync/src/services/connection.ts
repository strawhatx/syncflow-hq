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

// ✅ Save the databases to the db
export const saveDatabases = async (databases: Record<string, any>[]) => {
  const { data, error } = await supabase.from("connection_databases")
    .insert(databases)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// ✅ Save the table to the db
export const saveTable = async (table: Record<string, any>) => {
  const { data, error } = await supabase.from("connection_tables")
    .insert(table)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// ✅ Save the columns to the db
export const saveColumns = async (columns: Record<string, any>[]) => {
  const { error } = await supabase
    .from("connection_columns")
    .insert(columns);

  if (error) {
    throw new Error(error.message);
  }
}

// ✅ rollback the connection tables(database, tables, columns)
// if we rollback the connection_databases, we the on cascade delete 
// will delete the connection_tables and connection_columns related to it
// we judt need to track the ones that were recently added by the current
// connection_id.
// only call this if the sync fails.
export const rollbackDatabaseSync = async (connection_id: string) => {
  const { error } = await supabase
    .from("connection_databases")
    .delete()
    .eq("connection_id", connection_id);

  if (error) {
    throw new Error(error.message);
  }
}