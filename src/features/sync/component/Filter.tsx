// steps/NameStep.tsx
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useSync } from '@/contexts/SyncContext';
import { getImagePath } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SyncFilter, SyncTableMapping } from '@/types/sync';
import { ArrowRight, ArrowLeft, ArrowLeftRight, Settings } from 'lucide-react';
import { ConnectorWithConnections } from '@/services/connector/service';
import { useState } from 'react';
import { Filter } from '../helpers/filter';

interface TableHeaderProps {
    mapping: SyncTableMapping;
    connectors: ConnectorWithConnections[];
}


const TableHeader = (props: TableHeaderProps) => {
    const { mapping, connectors } = props;
    const sourceTable = connectors.find(connector => connector.connections.some(connection => connection.id === mapping.source_table_id));
    const destinationTable = connectors.find(connector => connector.connections.some(connection => connection.id === mapping.destination_table_id));

    const syncSeparatorConfig = {
        "source-to-destination": <ArrowRight className="h-4 w-4" />,
        "destination-to-source": <ArrowLeft className="h-4 w-4" />,
        "two-way": <ArrowLeftRight className="h-4 w-4" />
    }

    return (
        <div className="flex items-center justify-between gap-4 px-4">
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={!mapping.source_table_id || !mapping.destination_table_id}
                >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="sr-only">Toggle</span>
                </Button>
            </CollapsibleTrigger>

            <div className="flex w-full text-black gap-2 items-center py-1">
                <div className="flex w-full justify-between gap-2">
                    <div className="flex items-center justify-start gap-2">
                        <img
                            src={getImagePath(sourceTable?.icon)}
                            alt={sourceTable?.name}
                            className="h-4 w-4 object-contain"
                        />
                        <span className="text-sm">{sourceTable?.name}</span>
                    </div>

                    {syncSeparatorConfig[mapping.direction]}

                    <div className="flex items-center justify-start gap-2">
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
    const [isOpen, setIsOpen] = useState(false);
    const { syncConfig, connectors, setTableMappings, save } = useSync();
    const tableMappings = syncConfig.config?.schema?.table_mappings;

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
                        <Collapsible
                            open={isOpen}
                            onOpenChange={setIsOpen}
                            className="flex w-full flex-col gap-2"
                        >
                            <TableHeader connectors={connectors} mapping={mapping} />

                            <CollapsibleContent className="flex flex-col gap-2">
                                <Filter tableMapping={mapping} setTableMappings={setTableMappings} />
                            </CollapsibleContent>
                        </Collapsible>
                        {index !== tableMappings.length - 1 && <hr className=" border-gray-200" />}
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
        </div>
    );
}