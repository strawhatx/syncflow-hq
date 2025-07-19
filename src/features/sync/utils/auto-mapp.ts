import stringSimilarity from "string-similarity";
import { SyncTableMapping } from "@/types/sync";
import { ColumnOption, TableOption } from "@/types/connectors";

/**
 * Configuration options for the auto-mapping algorithm
 */
interface AutoMapConfig {
    tableMatchThreshold: number;
    columnMatchThreshold: number;
    nameWeight: number;
    enableCaching: boolean;
    maxCandidates: number;
}

const DEFAULT_CONFIG: AutoMapConfig = {
    tableMatchThreshold: 0.1, // Lowered for better matching
    columnMatchThreshold: 0.3,
    nameWeight: 0.7,
    enableCaching: true,
    maxCandidates: 10
};

/**
 * Normalize a string for consistent comparison
 */
const normalize = (col: ColumnOption): string => {
    return col.name
        .trim()
        .toLowerCase()
        .replace(/[_\s\-\.]/g, "") // Remove underscores, spaces, hyphens, and dots
        .replace(/[^a-z0-9]/g, ""); // Keep only alphanumeric characters
};

/**
 * Normalize table name for comparison
 */
const normalizeTableName = (tableName: string): string => {
    return tableName
        .trim()
        .toLowerCase()
        .replace(/[_\s\-\.]/g, "") // Remove underscores, spaces, hyphens, and dots
        .replace(/[^a-z0-9]/g, ""); // Keep only alphanumeric characters
};

/**
 * Find the best matching column in destination columns for a given source column
 * Uses string similarity to handle variations like email/email_address, user/username, etc.
 */
function findColumnMatch(
    sourceCol: ColumnOption,
    destCols: ColumnOption[],
    threshold = 0.5
): string | null {
    const normalizedSource = normalize(sourceCol);

    // Find matches using exact name or string similarity
    // string similrty is used to handle variations like email/email_address, 
    // user/username, etc. should be somewhat good
    // we also need to hand ids id should also match with customerid or userid 
    // or orderid or productid or etc.
    //TODO: maybe instad of that we create an exeception for primary keys   
    const match = destCols.filter(col => {
        const normalizedDest = normalize(col);
        return normalizedSource === normalizedDest ||
            (normalizedSource.toLocaleUpperCase().endsWith("ID") && normalizedDest.toLocaleUpperCase().endsWith("ID")) ||
            stringSimilarity.compareTwoStrings(normalizedSource, normalizedDest) >= threshold;
    });

    if (match.length > 0) {
        return match[0].name;
    }

    return null;
}

/**
 * Find the best matching table from a list of destination tables
 */
const findBestTableMatch = (
    source: TableOption,
    destinations: TableOption[],
    threshold = 0.3
): TableOption | null => {
    let bestMatch: TableOption | null = null;
    let bestScore = 0;

    // Find the best match using table name similarity
    const scores = destinations.map(dest => {
        const sourceNorm = normalizeTableName(source.name);
        const destNorm = normalizeTableName(dest.name);

        const nameScore = stringSimilarity.compareTwoStrings(sourceNorm, destNorm);

        return {
            table: dest,
            score: nameScore
        };
    });

    // Sort by score in descending order
    scores.sort((a, b) => b.score - a.score);

    // Get the best match
    bestMatch = scores[0]?.table || null;
    bestScore = scores[0]?.score || 0;

    console.log(`Best match: ${bestMatch?.name || 'none'} with score: ${bestScore.toFixed(3)} (threshold: ${threshold})`);

    // Only return match if it meets the minimum threshold
    return bestScore >= threshold ? bestMatch : null;
};

/**
 * auto-mapping function that maps tables and columns between source and destination
 * 
 * @param sourceTables List of source tables with their columns
 * @param destinationTables List of destination tables with their columns
 * @param config Optional configuration for fine-tuning the algorithm
 * @returns Array of table mappings with field mappings
 */
export const autoMap = (
    sourceTables: TableOption[],
    destinationTables: TableOption[],
    config: Partial<AutoMapConfig> = {}
): Omit<SyncTableMapping, "id">[] => {
    // Merge provided config with defaults
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    const mappings: Omit<SyncTableMapping, "id">[] = [];

    // Process each source table
    for (const sourceTable of sourceTables) {
        console.log(`Processing source table: ${sourceTable.name} (${sourceTable.columns?.length || 0} columns)`);

        // Find the best matching destination table
        const bestDest = findBestTableMatch(
            sourceTable,
            destinationTables,
            finalConfig.tableMatchThreshold
        );

        // Skip if no confident table match is found
        if (!bestDest) {
            console.debug(`No confident table match found for source table: ${sourceTable.name}`);
            continue;
        }

        console.log(`Found table match: ${sourceTable.name} -> ${bestDest.name}`);

        const fieldMappings: SyncTableMapping["field_mappings"] = [];

        // Map columns within the matched table pair
        for (const sourceCol of sourceTable.columns || []) {
            console.log(`Processing column: ${sourceCol.name}`);

            const matchedCol = findColumnMatch(
                sourceCol,
                bestDest.columns || [],
                finalConfig.columnMatchThreshold
            );

            if (!matchedCol) continue;

            fieldMappings.push({
                source_field_id: sourceCol.id,
                destination_field_id: matchedCol,
            });
        }

        // Only create mapping if we have at least one field mapped
        if (fieldMappings.length === 0) continue;

        mappings.push({
            source_table_id: sourceTable.id,
            destination_table_id: bestDest.id,
            field_mappings: fieldMappings,
        });
    }

    console.log(`AutoMap completed. Total mappings found: ${mappings.length}`);
    console.log('Final mappings:', mappings);

    return mappings;
};
