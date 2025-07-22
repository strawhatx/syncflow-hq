import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SyncDirection, SyncFieldMapping, SyncFilter, SyncTableMapping } from '@/types/sync';
import { useSync } from '@/contexts/SyncContext';
import { ConnectorProvider } from '@/types/connectors';
import { useDestinationTable, useSourceTable } from './useDataSources';
import { autoMap } from '../utils/auto-mapp';

/**
 * Comprehensive hook for managing table mappings in sync configurations.
 * 
 * This hook consolidates all table mapping logic including:
 * - State management for table mappings and selection
 * - CRUD operations (add, remove, update tables)
 * - Validation logic
 * - Dialog management
 * - Data source integration
 * - Auto-mapping functionality
 * 
 * @returns Object containing all table mapping state and operations
 * 
 * @example
 * ```tsx
 * const {
 *   tableMappings,
 *   addTable,
 *   removeTable,
 *   updateTable,
 *   isAllMappingsValid,
 *   openMappingDialog,
 *   closeMappingDialog,
 *   updateSelectedFieldMappings,
 *   updateSelectedFilters,
 * } = useTableMappings();
 * 
 * // Add a new table mapping
 * addTable();
 * 
 * // Update a specific table
 * updateTable(0, "source_table_id", "new_source_table");
 * 
 * // Check if all mappings are valid
 * const isValid = isAllMappingsValid();
 * 
 * // Open mapping dialog for editing
 * openMappingDialog(tableMappings[0], 0);
 * ```
 */
export function useTableMappingSelection() {
  const { syncConfig, connectors, setTableMappings, save } = useSync();
  // Extract data from sync config
  const tableMappings = syncConfig.config?.schema?.table_mappings || [];
  const sourceDatabaseId = syncConfig.config?.schema?.source_database_id;
  const destinationDatabaseId = syncConfig.config?.schema?.destination_database_id;
  
  // Find connectors
  const sourceConnector = connectors?.find(conn => 
    conn.connections.some(c => c.id === syncConfig.source_id)
  );
  const destinationConnector = connectors?.find(conn => 
    conn.connections.some(c => c.id === syncConfig.destination_id)
  );

  // Auto mapping disabled state
  const isAutoMappingDisabled = tableMappings.length > 0;

  // Table options from data sources
  const {
    data: sourceTableOptions = [],
    isLoading: isSourceTableLoading
  } = useSourceTable(sourceDatabaseId, sourceConnector?.provider as ConnectorProvider);

  const {
    data: destinationTableOptions = [],
    isLoading: isDestinationTableLoading
  } = useDestinationTable(destinationDatabaseId, destinationConnector?.provider as ConnectorProvider);

  // Table operations
  const addTable = () => {
    const newTable: SyncTableMapping = {
      id: uuidv4(),
      source_table_id: "",
      destination_table_id: "",
      field_mappings: [],
      direction: "source-to-destination",
      filters: [],
    };
    setTableMappings([...tableMappings, newTable]);
  };

  const removeTable = (index: number) => {
    setTableMappings(tableMappings.filter((_, i) => i !== index));
  };

  const updateTable = (
    index: number, 
    field: keyof SyncTableMapping, 
    value: string | SyncFieldMapping[] | SyncFilter[]
  ) => {
    setTableMappings(tableMappings.map((mapping, i) =>
      i === index ? { ...mapping, [field]: value } : mapping
    ));
  };

  const autoMapTables = () => {
    const mappings = autoMap(sourceTableOptions, destinationTableOptions);
    setTableMappings(mappings as SyncTableMapping[]);
  };

  // Validation
  const isValidMapping = (mapping: SyncTableMapping) => {
    return mapping.source_table_id && 
           mapping.destination_table_id &&
           mapping.field_mappings.length > 0;
  };

  const isAllMappingsValid = () => {
    return tableMappings.every(mapping => isValidMapping(mapping));
  };

  // Sync direction separator component factory
  const createSyncSeparator = (index: number, direction: SyncDirection) => {
    return {
      direction,
      onDirectionChange: (value: SyncDirection) => updateTable(index, "direction", value)
    };
  };

  return {
    // State
    tableMappings,
    sourceTableOptions,
    destinationTableOptions,
    isSourceTableLoading,
    isDestinationTableLoading,
    isAutoMappingDisabled,
    
    // Operations
    addTable,
    removeTable,
    updateTable,
    autoMapTables,
    
    // Validation
    isValidMapping,
    isAllMappingsValid,
    
    // Utilities
    createSyncSeparator,
    save,
  };
} 