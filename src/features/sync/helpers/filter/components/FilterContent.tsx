import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FilterRow } from "./FilterRow";
import { SyncFilter } from "@/types/sync";
import { ColumnOption } from "@/types/connectors";

interface FilterContentProps {
    app_name: string;
    columns: ColumnOption[];
    isColumnsLoading: boolean;
    filters: SyncFilter[];
    setFilters: React.Dispatch<React.SetStateAction<SyncFilter[]>>
}

export const FilterContent = (props: FilterContentProps) => {
    const { app_name, filters, columns, isColumnsLoading, setFilters } = props;
    // add field mapping
    const addFilter = () => {
        setFilters(prev => [...prev, {
            field_id: "",
            value: "",
            operator: "eq"
        }]);
    };

    const removeFilter = (index: number) => {
        setFilters(prev => prev.filter((_, i) => i !== index));
    };

    const updateFilter = (index: number, field: keyof SyncFilter, value: string) => {
        setFilters(prev => prev.map((filter, i) =>
            i === index ? { ...filter, [field]: value } : filter
        ));
    };

    return (
        <div className="space-y-4 border rounded-lg p-4">
            <p className="text-sm font-medium">{app_name} Filters</p>
            {filters?.map((filter, idx) => (
                <FilterRow
                    key={idx}
                    index={idx}
                    filter={filter}
                    columns={columns}
                    isColumnsLoading={isColumnsLoading}
                    updateFilter={updateFilter}
                    removeFilter={removeFilter}
                />
            ))}
            <div className="flex w-full justify-end">
                <Button
                    variant="outline"
                    className="text-sm text-muted-foreground py-1"
                    onClick={() => addFilter()}>
                    <Plus className="h-4 w-4" />
                    Add Condition
                </Button>
            </div>
        </div>
    )
};
