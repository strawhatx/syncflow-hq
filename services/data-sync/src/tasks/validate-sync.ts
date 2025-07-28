import { Sync } from "../types/sync";

const directionConfig = {
  source_to_destination: 'source-to-destination',
  destination_to_source: 'destination-to-source',
  two_way: 'two-way',
}

export async function validateSyncChanges(sync: Sync): Promise<boolean> {
  // check if the sync has a valid source and destination
  if (!sync.source_id || !sync.destination_id) {
    return false;
  }

  // get table mappings (core of the sync validations)
  const tableMappings = sync.config.schema.table_mappings;

  // check if the table mappings are valid
  if (!tableMappings || tableMappings.length === 0) {
    return false;
  }

  // direction 
  for (const mapping of tableMappings) {
    const { direction, source_table_id, destination_table_id, last_synced_at } = mapping;
    
    switch (direction) {
      case directionConfig.source_to_destination:
        if (last_synced_at) {
          return false;
        }
        break;
      case directionConfig.destination_to_source:
        if (!last_synced_at) {
          return false;
        }
        break;
      case directionConfig.two_way:
        if (!last_synced_at) {
          return false;
        }
        break;
      default:
        return false;
    }
  }

  // Returns true if there is data to sync for this mapping, false otherwise
  return true;
}