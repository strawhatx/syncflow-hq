import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldMapper } from "./components/FieldMapper";
import { useSync } from "@/contexts/SyncContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SyncFieldMapping } from "@/types/sync";


export const MappingDialog = () => {
    const { syncConfig, selectedTableMappingId, setSelectedTableMappingId, setTableMappings } = useSync();
    const tableMappings = syncConfig.config?.schema?.table_mappings
    const tableMapping = tableMappings?.find(mapping => mapping.id === selectedTableMappingId);
    const [fieldMappings, setFieldMappings] = useState<SyncFieldMapping[]>(tableMapping?.field_mappings || []);

    // save to
    const save = () => {
        setTableMappings(tableMappings?.map(mapping =>
            mapping.id === selectedTableMappingId ? { ...mapping, field_mappings: fieldMappings } : mapping
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

                <FieldMapper tableMapping={tableMapping} fieldMappings={fieldMappings} setFieldMappings={setFieldMappings} />
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