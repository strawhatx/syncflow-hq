import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldMapper } from "./components/FieldMapper";
import { Filter } from "./components/Filter";
import { SyncFieldMapping, SyncFilter, SyncTableMapping } from "@/types/sync";

interface MappingTabsProps {
    tableMapping: SyncTableMapping;
    fieldMappings: SyncFieldMapping[];
    setFieldMappings: (fieldMappings: SyncFieldMapping[]) => void;
    filter: SyncFilter[];
    setFilter: (filter: SyncFilter[]) => void;
}

const MappingTabs = (props: MappingTabsProps) => {
    const { tableMapping, fieldMappings, setFieldMappings, filter, setFilter } = props;
    return (
        <Tabs>
            <TabsList>  
                <TabsTrigger value="field-mapping">Field Mapping</TabsTrigger>
                <TabsTrigger value="filter">Filter</TabsTrigger>
            </TabsList>
            <TabsContent value="field-mapping">
                <FieldMapper tableMapping={tableMapping} fieldMappings={fieldMappings} setFieldMappings={setFieldMappings} />
            </TabsContent>
            <TabsContent value="filter">
                <Filter filters={filter} setFilters={setFilter} />
            </TabsContent>
        </Tabs>
    )
}

interface MappingDialogProps {
    tableMapping: SyncTableMapping;
    isOpen: boolean;
    onClose: () => void;
}

export const MappingDialog = (props: MappingDialogProps) => {
    const { tableMapping, isOpen, onClose } = props;
    const [fieldMappings, setFieldMappings] = useState<SyncFieldMapping[]>([]);
    const [filter, setFilter] = useState<SyncFilter[]>([]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] max-w-full md:max-w-xl lg:max-w-3xl">
                <DialogHeader>
                    <DialogTitle> Edit Field Mapping </DialogTitle>
                </DialogHeader>

                <MappingTabs tableMapping={tableMapping} fieldMappings={fieldMappings} setFieldMappings={setFieldMappings} filter={filter} setFilter={setFilter} />

                <DialogFooter className="flex flex-row gap-2 justify-end">
                    <Button variant="destructive" className="w-fit h-8" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>

        </Dialog >
    )
}