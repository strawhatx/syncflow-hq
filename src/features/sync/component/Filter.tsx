// steps/NameStep.tsx
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useSync } from '@/contexts/SyncContext';
import { getImagePath } from '@/lib/utils';
import { SyncTableMapping } from '@/types/sync';
import { ArrowRight, ArrowLeft, ArrowLeftRight, Settings } from 'lucide-react';
import { ConnectorWithConnections } from '@/services/connector/service';
import { useState } from 'react';
import { useDestinationTable, useSourceTable } from '../hooks/useDataSources';
import { ConnectorProvider } from '@/types/connectors';
import { FilterDialog } from '../helpers/filter/index';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TableContentProps {
    sourceConnector: ConnectorWithConnections;
    destinationConnector: ConnectorWithConnections;
    setSelectedTableMappingId: (id: string) => void;
    mapping: SyncTableMapping;
    setType: (type: "source" | "destination") => void;
}

const TableContent = (props: TableContentProps) => {
    const { sourceConnector, destinationConnector, setSelectedTableMappingId, mapping, setType } = props;
    const { data: sourceTable } = useSourceTable(mapping.source_table_id, sourceConnector?.provider as ConnectorProvider);
    const { data: destinationTable } = useDestinationTable(mapping.destination_table_id, destinationConnector?.provider as ConnectorProvider);

    const syncSeparatorConfig = {
        "source-to-destination": <ArrowRight className="h-8 w-8" />,
        "destination-to-source": <ArrowLeft className="h-8 w-8" />,
        "two-way": <ArrowLeftRight className="h-8 w-8" />
    }

    return (
        <div className="flex w-full text-black gap-2 items-center py-1">
            <div className="flex w-full justify-between gap-2">
                <div className="flex w-full items-center justify-start gap-2">
                    <img
                        src={getImagePath(sourceTable?.icon)}
                        alt={sourceTable?.name}
                        className="h-4 w-4 object-contain"
                    />
                    <span className="text-sm">{sourceTable?.name}</span>
                </div>

                {syncSeparatorConfig[mapping.direction]}

                <div className="flex w-full items-center justify-start gap-2">
                    <img
                        src={getImagePath(destinationTable?.icon)}
                        alt={destinationTable?.name}
                        className="h-4 w-4 object-contain"
                    />

                    <span className="text-sm">{destinationTable?.name}</span>
                </div>
            </div>
        </div>
    )
}


export default function FilterStep({ next }: { next: () => void }) {
    // filter state
    const [type, setType] = useState<"source" | "destination" >("source");
    const [selectedTableMappingId, setSelectedTableMappingId] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // sync config
    const { syncConfig, connectors, saveAndAdvance } = useSync();
    const tableMappings = syncConfig.config?.schema?.table_mappings;
    const sourceConnector = connectors.find(connector => connector.connections.some(connection => connection.id === syncConfig?.source_id));
    const destinationConnector = connectors.find(connector => connector.connections.some(connection => connection.id === syncConfig?.destination_id));
    const connector = type === "source" ? sourceConnector : destinationConnector;
    
    // handle next
    const handleNext = async () => {
        try {
            // save to database
            saveAndAdvance().then(() => {
                next(); // move to next step
            });
        }
        catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleFilter = (type: "source" | "destination", mappingId: string) => {
        setType(type);
        setSelectedTableMappingId(mappingId);

        // open filter dialog
        setIsFilterOpen(true);
    }

    return (
        <div>
            {tableMappings.map((mapping, index) => {
                return (
                    <div key={index} className="flex bg-gray-50 rounded-lg py-2 px-4 gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Settings className="w-4 h-4 text-gray-500" />
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel
                                    onClick={() => handleFilter("source", mapping.id)}
                                    className="cursor-pointer text-sm">
                                    {sourceConnector.name}
                                </DropdownMenuLabel>

                                <DropdownMenuLabel
                                    onClick={() => handleFilter("destination", mapping.id)}
                                    className="cursor-pointer text-sm">
                                    {destinationConnector.name}
                                </DropdownMenuLabel>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <TableContent
                            setSelectedTableMappingId={setSelectedTableMappingId}
                            setType={setType}
                            sourceConnector={sourceConnector}
                            destinationConnector={destinationConnector}
                            mapping={mapping} />
                    </div>
                )
            })}

            <div className="mt-4">
                <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 h-8"
                >
                    Next
                </Button>
            </div>

            {isFilterOpen && (
                <FilterDialog
                    connector={connector}
                    type={type}
                    setType={setType}
                    open={isFilterOpen}
                    setOpen={setIsFilterOpen}
                    selectedTableMappingId={selectedTableMappingId}
                    setSelectedTableMappingId={setSelectedTableMappingId}
                />
            )}
        </div>
    );
}