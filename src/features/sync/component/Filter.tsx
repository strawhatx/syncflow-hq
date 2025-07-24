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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface FilterMenuProps {
    mappingId: string;
    setType: (type: "source" | "destination") => void;
    setSelectedTableMappingId: (id: string) => void;

    sourceConnector: ConnectorWithConnections;
    destinationConnector: ConnectorWithConnections;
}

const FilterMenu = (props: FilterMenuProps) => {
    const { sourceConnector, destinationConnector, mappingId, setType, setSelectedTableMappingId } = props;
    const handleFilter = (type: "source" | "destination") => {
        setType(type);
        setSelectedTableMappingId(mappingId);
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="sr-only">Toggle</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel
                    onClick={() => handleFilter("source")}
                    className="cursor-pointer">
                    {sourceConnector.name}
                </DropdownMenuLabel>

                <DropdownMenuLabel
                    onClick={() => handleFilter("destination")}
                    className="cursor-pointer">
                    {destinationConnector.name}
                </DropdownMenuLabel>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

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
        "source-to-destination": <ArrowRight className="h-6 w-6" />,
        "destination-to-source": <ArrowLeft className="h-6 w-6" />,
        "two-way": <ArrowLeftRight className="h-6 w-6" />
    }

    return (
        <div className="flex items-center justify-between gap-4 px-4">

            <FilterMenu
                mappingId={mapping.id}
                setSelectedTableMappingId={setSelectedTableMappingId}
                setType={setType}
                sourceConnector={sourceConnector}
                destinationConnector={destinationConnector}
            />

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
        </div>
    )
}


export default function FilterStep({ next }: { next: () => void }) {
    const [type, setType] = useState<"source" | "destination">("source");
    const { syncConfig, connectors, selectedTableMappingId, setSelectedTableMappingId, save } = useSync();
    const tableMappings = syncConfig.config?.schema?.table_mappings;
    const sourceConnector = connectors.find(connector => connector.connections.some(connection => connection.id === syncConfig?.source_id));
    const destinationConnector = connectors.find(connector => connector.connections.some(connection => connection.id === syncConfig?.destination_id));

    const handleNext = async () => {
        try {
            // save to database
            save().then(() => {
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

    return (
        <div>
            {tableMappings.map((mapping, index) => {
                return (
                    <div key={index} className="flex flex-col gap-0">
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

            {selectedTableMappingId && (
                <FilterDialog
                    type={type}
                    connector={sourceConnector} />
            )}
        </div>
    );
}