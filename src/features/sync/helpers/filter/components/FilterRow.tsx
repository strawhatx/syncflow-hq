import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnOption } from "@/types/connectors";
import { SyncFilter } from "@/types/sync";
import { X } from "lucide-react";

interface FilterRowProps {
    filter: SyncFilter;
    index: number;
    columns: ColumnOption[];
    isColumnsLoading: boolean;
    updateFilter: (index: number, field: "field_id" | "value", value: any) => void;
    removeFilter: (index: number) => void;
}

export const FilterRow = (props: FilterRowProps) => {
    const { filter, index, columns, isColumnsLoading, updateFilter, removeFilter } = props;

    return (
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-background">
        {/* Field Selection */}
        <div className="flex-1">
            <Select
                value={filter.field_id}
                onValueChange={(value) => updateFilter(index, 'field_id', value)}
                disabled={isColumnsLoading}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                    {columns.map((column) => (
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
    )
}