import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchColumnsByTableId, fetchConnectionDatabases, fetchTableById, fetchTablesByDatabaseId } from "@/services/connections/service";
import { ConnectorProvider } from "@/types/connectors";

// React Query hooks

// Databases
export function useSourceDatabases(connection_id: string) {
  // use memo to create a unique query key for the source data
  const queryKey = useMemo(() => ["sourceData", connection_id], [connection_id]);
  
  return useQuery({
    queryKey,
    queryFn: () => fetchConnectionDatabases(connection_id),
    enabled: !!connection_id,
  });
}

export function useDestinationDatabases(connection_id: string) {
  // use memo to create a unique query key for the destination data
  const queryKey = useMemo(() => ["destinationData", connection_id], [connection_id]);
  
  return useQuery({
    queryKey,
    queryFn: () => fetchConnectionDatabases(connection_id),
    enabled: !!connection_id,
  });
}

// Tables
export function useSourceTables(database_id: string, provider: ConnectorProvider) {
  // use memo to create a unique query key for the source table
  const queryKey = useMemo(() => ["sourceTables", database_id, provider], [database_id, provider]);
  
  return useQuery({
    queryKey,
    queryFn: () => fetchTablesByDatabaseId(database_id, provider),
    enabled: !!database_id,
  });
}

export function useDestinationTables(database_id: string, provider: ConnectorProvider) {
  // use memo to create a unique query key for the destination table
  const queryKey = useMemo(() => ["destinationTables", database_id, provider], [database_id, provider]);
  
  return useQuery({
    queryKey,
    queryFn: () => fetchTablesByDatabaseId(database_id, provider),
    enabled: !!database_id,
  });
}

export function useSourceTable(table_id: string, provider: ConnectorProvider) {
  // use memo to create a unique query key for the source table
  const queryKey = useMemo(() => ["sourceTable", table_id, provider], [table_id, provider]);
  
  return useQuery({
    queryKey,
    queryFn: () => fetchTableById(table_id, provider),
    enabled: !!table_id,
  });
}

export function useDestinationTable(table_id: string, provider: ConnectorProvider) {
  // use memo to create a unique query key for the destination table
  const queryKey = useMemo(() => ["destinationTable", table_id, provider], [table_id, provider]);
  
  return useQuery({
    queryKey,
    queryFn: () => fetchTableById(table_id, provider),
    enabled: !!table_id,
  });
}

// Columns
export function useSourceColumns(table_id: string) {
  const queryKey = useMemo(() => ["sourceColumns", table_id], [table_id]);
  
  return useQuery({
    queryKey,
    queryFn: () => fetchColumnsByTableId(table_id),
    enabled: !!table_id,
  });
}

export function useDestinationColumns(table_id: string) {
  const queryKey = useMemo(() => ["destinationColumns", table_id], [table_id]);
  
  return useQuery({
    queryKey,
    queryFn: () => fetchColumnsByTableId(table_id),
    enabled: !!table_id,
  });
}