import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSync } from "@/contexts/SyncContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SyncFilter } from "@/types/sync";
import { ConnectorWithConnections } from "@/services/connector/service";
import { FilterContent } from "./components/FilterContent";
import { useDestinationColumns, useSourceColumns } from "../../hooks/useDataSources";

interface FilterDialogProps {
    type: "source" | "destination";
    connector: ConnectorWithConnections;
}

export const FilterDialog = (props: FilterDialogProps) => {
    const { type, connector } = props;
    const { syncConfig, selectedTableMappingId, setSelectedTableMappingId, setTableMappings } = useSync();
    const tableMappings = syncConfig.config?.schema?.table_mappings
    const tableMapping = tableMappings?.find(mapping => mapping.id === selectedTableMappingId);
    const [filters, setFilters] = useState<SyncFilter[]>(tableMapping?.filters?.[type] || []);
    const { data: sourceColumns } = useSourceColumns(syncConfig.source_id);
    const { data: destinationColumns } = useDestinationColumns(syncConfig.destination_id);
    const columns = type === "source" ? sourceColumns : destinationColumns;

    // save to
    const save = () => {
        setTableMappings(tableMappings?.map(mapping =>
            mapping.id === selectedTableMappingId ? { ...mapping, filters: { ...mapping.filters, [type]: filters } } : mapping
        ));

        setSelectedTableMappingId(null);
    };
    return (
        <Dialog
            open={selectedTableMappingId !== null && selectedTableMappingId !== undefined}
            onOpenChange={() => setSelectedTableMappingId(null)}
        >
            <DialogContent className="max-h-[80vh] max-w-full md:max-w-xl lg:max-w-3xl">
                <DialogHeader>
                    <DialogTitle> Edit Field Mapping </DialogTitle>
                </DialogHeader>

                <FilterContent
                    app_name={connector?.name}
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