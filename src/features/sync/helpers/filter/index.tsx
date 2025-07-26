import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSync } from "@/contexts/SyncContext";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { SyncFilter } from "@/types/sync";
import { ConnectorWithConnections } from "@/services/connector/service";
import { FilterContent } from "./components/FilterContent";
import { useDestinationColumns, useSourceColumns } from "../../hooks/useDataSources";

interface FilterDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    type: "source" | "destination";
    setType: (type: "source" | "destination" | null) => void;
    connector: ConnectorWithConnections;
    selectedTableMappingId: string | null;
    setSelectedTableMappingId: (id: string | null) => void;
}

export const FilterDialog = (props: FilterDialogProps) => {
    const { connector, type, setType, open, setOpen, selectedTableMappingId, setSelectedTableMappingId } = props;
    const { syncConfig, setTableMappings } = useSync();
    const tableMappings = syncConfig.config?.schema?.table_mappings
    const tableMapping = tableMappings?.find(mapping => mapping.id === selectedTableMappingId);
    const [filters, setFilters] = useState<SyncFilter[]>(tableMapping?.filters?.[type] || []);
    const { data: sourceColumns } = useSourceColumns(tableMapping?.source_table_id);
    const { data: destinationColumns } = useDestinationColumns(tableMapping?.destination_table_id);
    const columns = type === "source" ? sourceColumns : destinationColumns;

    // save to
    const save = () => {
        setTableMappings(tableMappings?.map(mapping =>
            mapping.id === selectedTableMappingId ? { ...mapping, filters: { ...mapping.filters, [type]: filters } } : mapping
        ));

        handleOpenChange();
    };

    const handleOpenChange = () => {
        setSelectedTableMappingId(null);
        setOpen(false);
        setType(null);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={() => handleOpenChange()}
        >
            <DialogContent
                className="max-h-[80vh] max-w-full md:max-w-xl lg:max-w-3xl"
                aria-describedby="filter-dialog"
            >
                <DialogHeader>
                    <DialogTitle className="text-sm font-medium"> {connector?.name} </DialogTitle>
                </DialogHeader>

                <FilterContent
                    filters={filters}
                    columns={columns}
                    isColumnsLoading={false}
                    setFilters={setFilters}
                />
                <DialogFooter>
                    <Button
                        variant="destructive"
                        className="w-fit h-8"
                        onClick={() => setSelectedTableMappingId(null)}>Close</Button>
                    <Button
                        variant="default"
                        className="w-fit h-8"
                        onClick={save}>Save</Button>
                </DialogFooter>
            </DialogContent>

        </Dialog >
    )
}