import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSourceColumns } from "@/features/sync/hooks/useDataSources";
import { SyncFilter, SyncTableMapping } from "@/types/sync";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface FilterProps {
    tableMapping: SyncTableMapping;
    setTableMappings: (tableMappings: SyncTableMapping[]) => void;
}

export const Filter = (props: FilterProps) => {
    const { tableMapping } = props;
    const [filters, setFilters] = useState<SyncFilter[]>([]);
    
    // Get source columns for field selection
    const { data: sourceColumns = [], isLoading: isSourceColumnsLoading } = useSourceColumns(tableMapping?.source_table_id);

    // Add a new filter
    const addFilter = () => {
        setFilters(prev => [...prev, {
            source_field: "",
            operator: "eq", // Always equals
            value: ""
        }]);
    };

    // Remove a filter
    const removeFilter = (index: number) => {
        setFilters(prev => prev.filter((_, i) => i !== index));
    };

    // Update a filter field
    const updateFilter = (index: number, field: "source_field" | "value", value: any) => {
        setFilters(prev => prev.map((filter, i) => {
            if (i === index) {
                return { ...filter, [field]: value, operator: "eq" }; // Always eq
            }
            return filter;
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Filters</h3>
                <Button
                    variant="outline" 
                    size="sm" 
                    onClick={addFilter}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Filter
                </Button>
            </div>

            {filters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No filters added yet.</p>
                    <p className="text-sm">Click "Add Filter" to start filtering your data.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filters.map((filter, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 border rounded-lg bg-background">
                            {/* Field Selection */}
                            <div className="flex-1">
                                <Select
                                    value={filter.source_field}
                                    onValueChange={(value) => updateFilter(index, 'source_field', value)}
                                    disabled={isSourceColumnsLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sourceColumns.map((column) => (
                                            <SelectItem key={column.id} value={column.id}>
                                                {column.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Operator (fixed to Equals) */}
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                =
                            </div>

                            {/* Value Input */}
                            <div className="flex-1">
                                <Input
                                    placeholder="Enter value"
                                    value={String(filter.value || '')}
                                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                                    className="flex-1"
                                />
                            </div>

                            {/* Remove Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFilter(index)}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {filters.length > 0 && (
                <div className="text-sm text-muted-foreground">
                    <p>Filters will be applied to the source data before syncing.</p>
                    <p>All filters use \"Equals\" logic and are combined with AND.</p>
                </div>
            )}
        </div>
    );
};
// ... existing code ...