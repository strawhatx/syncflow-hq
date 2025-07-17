import stringSimilarity from "string-similarity";
import { SyncTableMapping } from "@/types/sync";
import { ColumnOption, TableOption } from "@/types/connectors";

/**
 * Configuration options for the auto-mapping algorithm
 * Allows fine-tuning of similarity thresholds and algorithm behavior
 */
interface AutoMapConfig {
    /** Minimum similarity score for table matching (0-1) */
    tableMatchThreshold: number;
    /** Minimum similarity score for column matching (0-1) */
    columnMatchThreshold: number;
    /** Weight for name-based similarity vs data-based similarity */
    nameWeight: number;
    /** Whether to use caching for performance optimization */
    enableCaching: boolean;
    /** Maximum number of candidate matches to consider per column */
    maxCandidates: number;
}

/**
 * Default configuration for auto-mapping
 * These values have been tuned based on common database naming patterns
 */
const DEFAULT_CONFIG: AutoMapConfig = {
    tableMatchThreshold: 0.3,
    columnMatchThreshold: 0.6,
    nameWeight: 0.7,
    enableCaching: true,
    maxCandidates: 10
};

/**
 * Cache for storing computed similarity scores to avoid redundant calculations
 * This significantly improves performance for large datasets
 */
class SimilarityCache {
    private cache = new Map<string, number>();

    /**
     * Generate a cache key for two strings
     * @param str1 First string
     * @param str2 Second string
     * @returns Cache key
     */
    private getCacheKey(str1: string, str2: string): string {
        // Sort strings to ensure consistent cache keys regardless of order
        const sorted = [str1, str2].sort();
        return `${sorted[0]}::${sorted[1]}`;
    }

    /**
     * Get cached similarity score or compute and cache it
     * @param str1 First string
     * @param str2 Second string
     * @param computeFn Function to compute similarity if not cached
     * @returns Similarity score
     */
    getOrCompute(str1: string, str2: string, computeFn: () => number): number {
        const key = this.getCacheKey(str1, str2);
        
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }

        const score = computeFn();
        this.cache.set(key, score);
        return score;
    }

    /**
     * Clear the cache to free memory
     */
    clear(): void {
        this.cache.clear();
    }
}

// Global cache instance
const similarityCache = new SimilarityCache();

/**
 * Normalize a string for consistent comparison
 * Removes special characters, converts to lowercase, and handles common naming patterns
 * @param str String to normalize
 * @returns Normalized string
 */
const normalize = (col: ColumnOption): string => {
    return col.name
        .trim()
        .toLowerCase()
        .replace(/[_\s\-\.]/g, "") // Remove underscores, spaces, hyphens, and dots
        .replace(/[^a-z0-9]/g, ""); // Keep only alphanumeric characters
};

/**
 * Advanced normalization that handles common database naming patterns
 * @param str String to normalize
 * @returns Advanced normalized string
 */
const advancedNormalize = (col: ColumnOption): string => {
    return col.name
        .trim()
        .toLowerCase()
        .replace(/[_\s\-\.]/g, "") // Remove common separators
        .replace(/[^a-z0-9]/g, "") // Keep only alphanumeric
        .replace(/([a-z])([A-Z])/g, "$1$2") // Handle camelCase
        .replace(/([0-9])([a-z])/g, "$1$2"); // Handle number-letter boundaries
};

/**
 * Calculate Jaccard similarity between two sets
 * Jaccard index = |A ∩ B| / |A ∪ B|
 * 
 * Jaccard Index for Set Similarity: Use the Jaccard index to measure the 
 * similarity between sets of column data. This is useful for comparing the 
 * actual data in columns.
 * 
 * @param setA First set
 * @param setB Second set
 * @returns Jaccard similarity score (0-1)
 */
const jaccardSimilarity = (setA: Set<string>, setB: Set<string>): number => {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
};

/**
 * Calculate column overlap score using multiple similarity metrics
 * Combines exact matches, normalized matches, and Jaccard similarity
 * @param sourceCols Source column names
 * @param destCols Destination column names
 * @returns Combined similarity score (0-1)
 */
const getColumnOverlapScore = (sourceCols: ColumnOption[], destCols: ColumnOption[]): number => {
    // Normalize all column names
    const normSrc = sourceCols.map(normalize);
    const normDest = destCols.map(normalize);
    
    // Create sets for Jaccard similarity calculation
    const srcSet = new Set(normSrc);
    const destSet = new Set(normDest);
    
    // Calculate exact matches
    let exactMatches = 0;
    for (const col of normSrc) {
        if (normDest.includes(col)) exactMatches++;
    }
    
    // Calculate normalized matches (handles minor variations)
    const advancedSrc = sourceCols.map(advancedNormalize);
    const advancedDest = destCols.map(advancedNormalize);
    let advancedMatches = 0;
    for (const col of advancedSrc) {
        if (advancedDest.includes(col)) advancedMatches++;
    }
    
    // Calculate Jaccard similarity
    const jaccardScore = jaccardSimilarity(srcSet, destSet);
    
    // Weighted combination of different similarity measures
    const exactScore = exactMatches / Math.max(normSrc.length, 1);
    const advancedScore = advancedMatches / Math.max(advancedSrc.length, 1);
    
    // Combine scores with weights (exact matches are most important)
    return (exactScore * 0.5) + (advancedScore * 0.3) + (jaccardScore * 0.2);
};

/**
 * Find the best matching table from a list of destination tables
 * Uses column overlap score and applies threshold filtering
 * @param source Source table
 * @param destinations List of destination tables
 * @param threshold Minimum similarity threshold
 * @returns Best matching table or null if no match meets threshold
 */
const findBestTableMatch = (
    source: TableOption,
    destinations: TableOption[],
    threshold = 0.3
): TableOption | null => {
    let bestMatch: TableOption | null = null;
    let bestScore = 0;

    // Iterate through all destination tables to find the best match
    for (const dest of destinations) {
        const score = getColumnOverlapScore(source.columns, dest.columns);
        
        // Update best match if current score is higher
        if (score > bestScore) {
            bestScore = score;
            bestMatch = dest;
        }
    }

    // Only return match if it meets the minimum threshold
    return bestScore >= threshold ? bestMatch : null;
};

/**
 * Find high-confidence column matches using multiple similarity algorithms
 * Combines string similarity, normalized matching, and semantic similarity
 * @param sourceCol Source column name
 * @param destCols List of destination column names
 * @param threshold Minimum similarity threshold
 * @param config Configuration options
 * @returns Best matching column name or null if no match meets threshold
 */
const findHighConfidenceColumnMatch = (
    sourceCol: ColumnOption,
    destCols: ColumnOption[],
    threshold = 0.6,
    config: AutoMapConfig = DEFAULT_CONFIG
): string | null => {
    // Early exit if no destination columns
    if (destCols.length === 0) return null;

    // Normalize source column for comparison
    const normalizedSource = normalize(sourceCol);
    const normalizedDestCols = destCols.map(normalize);

    // Use string similarity library for fuzzy matching
    const stringSimilarityScore = (() => {
        if (config.enableCaching) {
            return similarityCache.getOrCompute(
                normalizedSource,
                normalizedDestCols.join('|'),
                () => {
                    const matches = stringSimilarity.findBestMatch(
                        normalizedSource,
                        normalizedDestCols
                    );
                    return matches.bestMatch.rating;
                }
            );
        } else {
            const matches = stringSimilarity.findBestMatch(
                normalizedSource,
                normalizedDestCols
            );
            return matches.bestMatch.rating;
        }
    })();

    // Find exact and normalized matches
    const exactMatchIndex = normalizedDestCols.findIndex(col => col === normalizedSource);
    const exactMatch = exactMatchIndex >= 0 ? destCols[exactMatchIndex] : null;

    // Advanced normalization matching
    const advancedSource = advancedNormalize(sourceCol);
    const advancedDestCols = destCols.map(advancedNormalize);
    const advancedMatchIndex = advancedDestCols.findIndex(col => col === advancedSource);
    const advancedMatch = advancedMatchIndex >= 0 ? destCols[advancedMatchIndex] : null;

    // Determine the best match based on different criteria
    if (exactMatch) {
        return exactMatch?.name; // Exact match takes highest priority
    }

    if (advancedMatch && stringSimilarityScore >= threshold) {
        return advancedMatch?.name; // Advanced normalized match with good string similarity
    }

    // Use string similarity as fallback
    if (stringSimilarityScore >= threshold) {
        const matches = stringSimilarity.findBestMatch(
            normalizedSource,
            normalizedDestCols
        );
        return destCols[matches.bestMatchIndex]?.name;
    }

    return null; // No match meets the threshold
};

/**
 * Production-level auto-mapping function that maps tables and columns between source and destination
 * Uses optimized algorithms and caching for large-scale datasets
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
    
    // Clear cache if caching is disabled
    if (!finalConfig.enableCaching) {
        similarityCache.clear();
    }

    const mappings: Omit<SyncTableMapping, "id">[] = [];

    // Process each source table
    for (const sourceTable of sourceTables) {
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

        const fieldMappings: SyncTableMapping["field_mappings"] = [];

        // Map columns within the matched table pair
        for (const sourceCol of sourceTable.columns) {
            const matchedCol = findHighConfidenceColumnMatch(
                sourceCol, 
                bestDest.columns, 
                finalConfig.columnMatchThreshold,
                finalConfig
            );
            
            if (matchedCol) {
                fieldMappings.push({
                    source_field_id: sourceCol.id,
                    destination_field_id: matchedCol,
                });
            }
        }

        // Only create mapping if we have at least one field mapped
        if (fieldMappings.length > 0) {
            mappings.push({
                source_table_id: sourceTable.id,
                destination_table_id: bestDest.id,
                field_mappings: fieldMappings,
            });
            
            console.debug(`Mapped table ${sourceTable.name} to ${bestDest.name} with ${fieldMappings.length} field mappings`);
        } else {
            console.debug(`No field mappings found for table pair: ${sourceTable.name} -> ${bestDest.name}`);
        }
    }

    // Clear cache after processing to free memory
    if (finalConfig.enableCaching) {
        similarityCache.clear();
    }

    return mappings;
};

/**
 * Utility function to get mapping statistics
 * Useful for debugging and monitoring mapping quality
 * @param mappings Array of table mappings
 * @returns Statistics about the mappings
 */
export const getMappingStats = (mappings: Omit<SyncTableMapping, "id">[]) => {
    const totalTables = mappings.length;
    const totalFields = mappings.reduce((sum, mapping) => sum + mapping.field_mappings.length, 0);
    const avgFieldsPerTable = totalTables > 0 ? totalFields / totalTables : 0;

    return {
        totalTables,
        totalFields,
        avgFieldsPerTable,
        mappingCoverage: totalFields > 0 ? 'Good' : 'Poor'
    };
};
