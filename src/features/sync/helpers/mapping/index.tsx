import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldMapper } from "./components/FieldMapper";
import { Filter } from "./components/Filter";
import { SyncFieldMapping, SyncFilter, SyncTableMapping } from "@/types/sync";

interface MappingTabsProps {
    tableMapping: SyncTableMapping;
    setFieldMapping: (fieldMapping: SyncFieldMapping[]) => void;
    setFilter: (filter: SyncFilter[]) => void;
}

const MappingTabs = (props: MappingTabsProps) => {
    const { tableMapping, setFieldMapping, setFilter } = props;
    return (
        <Tabs>
            <TabsList>
                <TabsTrigger value="field-mapping">Field Mapping</TabsTrigger>
                <TabsTrigger value="filter">Filter</TabsTrigger>
            </TabsList>
            <TabsContent value="field-mapping">
                <FieldMapper
                    tableMapping={tableMapping}
                    fieldMappings={tableMapping.field_mappings}
                    setFieldMappings={setFieldMapping}
                />
            </TabsContent>
            <TabsContent value="filter">
                <Filter filters={tableMapping.filters} setFilters={setFilter} />
            </TabsContent>
        </Tabs>
    )
}

interface MappingDialogProps {
    tableMapping: SyncTableMapping;
    setFieldMapping: (fieldMapping: SyncFieldMapping[]) => void;
    setFilter: (filter: SyncFilter[]) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const MappingDialog = (props: MappingDialogProps) => {
    const { tableMapping, setFieldMapping, setFilter, isOpen, onClose } = props;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] max-w-full md:max-w-xl lg:max-w-3xl">
                <DialogHeader>
                    <DialogTitle> Edit Field Mapping </DialogTitle>
                </DialogHeader>

                <MappingTabs 
                tableMapping={tableMapping} 
                setFieldMapping={setFieldMapping} 
                setFilter={setFilter} />

                <DialogFooter className="flex flex-row gap-2 justify-end">
                    <Button variant="destructive" className="w-fit h-8" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>

        </Dialog >
    )
}