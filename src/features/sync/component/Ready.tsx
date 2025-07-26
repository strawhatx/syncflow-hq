import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowLeftRight, ArrowRight, CheckCircle, Play, Settings } from 'lucide-react';
import { useSync } from '@/contexts/SyncContext';
import { getImagePath } from '@/lib/utils';
import { ConnectorWithConnections } from '@/services/connector/service';
import { useSourceTable, useDestinationTable } from '../hooks/useDataSources';
import { ConnectorProvider } from '@/types/connectors';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReadyStepProps {
    onActivate?: () => void;
}

const syncSeparatorConfig = {
    "source-to-destination": <ArrowRight className="h-4 w-4" />,
    "destination-to-source": <ArrowLeft className="h-4 w-4" />,
    "two-way": <ArrowLeftRight className="h-4 w-4" />
}

export const ReadyStep = ({ onActivate }: ReadyStepProps) => {
    const { syncConfig, connectors, activate } = useSync();
    const [isActivating, setIsActivating] = useState(false);
    const navigate = useNavigate();

    const sourceConnector = connectors?.find(connector =>
        connector.connections.some(connection => connection.id === syncConfig?.source_id)
    );
    const destinationConnector = connectors?.find(connector =>
        connector.connections.some(connection => connection.id === syncConfig?.destination_id)
    );

    const tableMappings = syncConfig?.config?.schema?.table_mappings || [];
    
    const handleActivate = async () => {
        if (!syncConfig) return;

        setIsActivating(true);
        try {
            await activate();

            toast({
                title: 'Sync Activated',
                description: 'Your sync has been successfully activated and is now running.',
            });

            onActivate?.();

            // Navigate to syncs page after a short delay
            setTimeout(() => {
                navigate('/syncs');
            }, 1500);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to activate sync',
                variant: 'destructive',
            });
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-900">Ready to Sync!</h2>
                <p className="text-gray-600">
                    Your sync configuration is complete. Review the details below and activate when ready.
                </p>
            </div>

            <div className="grid gap-4">
                {/* Sync Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Sync Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Sync Name:</span>
                            <span className="text-sm text-gray-900">{syncConfig?.name || 'Untitled Sync'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Schedule:</span>
                            <Badge variant="secondary">{syncConfig?.config?.schedule || 'every 1 minute'}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Conflict Resolution:</span>
                            <Badge variant="secondary">{syncConfig?.config?.conflict_resolution || 'latest'}</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Connection Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Connections</CardTitle>
                        <CardDescription>Source and destination connections</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <img
                                    src={getImagePath(sourceConnector?.icon)}
                                    alt={sourceConnector?.name}
                                    className="w-6 h-6 object-contain"
                                />
                                <div>
                                    <p className="font-medium text-sm">{sourceConnector?.name}</p>
                                    <p className="text-xs text-gray-500">Source</p>
                                </div>
                            </div>
                            <Badge variant="outline">Source</Badge>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs">→</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <img
                                    src={getImagePath(destinationConnector?.icon)}
                                    alt={destinationConnector?.name}
                                    className="w-6 h-6 object-contain"
                                />
                                <div>
                                    <p className="font-medium text-sm">{destinationConnector?.name}</p>
                                    <p className="text-xs text-gray-500">Destination</p>
                                </div>
                            </div>
                            <Badge variant="outline">Destination</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Mappings Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Table Mappings</CardTitle>
                        <CardDescription>{tableMappings.length} table(s) configured</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {tableMappings.map((mapping, index) => (
                                <TableMappingSummary
                                    key={mapping.id || index}
                                    mapping={mapping}
                                    sourceConnector={sourceConnector}
                                    destinationConnector={destinationConnector}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activate Button */}
            <div className="flex justify-center pt-4">
                <Button
                    onClick={handleActivate}
                    disabled={isActivating}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 flex items-center gap-2"
                    size="lg"
                >
                    <Play className="w-5 h-5" />
                    {isActivating ? 'Activating...' : 'Activate Sync'}
                </Button>
            </div>
        </div>
    );
};

interface TableMappingSummaryProps {
    mapping: any;
    sourceConnector: ConnectorWithConnections | undefined;
    destinationConnector: ConnectorWithConnections | undefined;
}

const TableMappingSummary = ({ mapping, sourceConnector, destinationConnector }: TableMappingSummaryProps) => {
    const { data: sourceTable } = useSourceTable(mapping.source_table_id, sourceConnector?.provider as ConnectorProvider);
    const { data: destinationTable } = useDestinationTable(mapping.destination_table_id, destinationConnector?.provider as ConnectorProvider);

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
                <img
                    src={getImagePath(sourceTable?.icon)}
                    alt={sourceTable?.name}
                    className="w-4 h-4 object-contain"
                />
                <span className="text-sm font-medium">{sourceTable?.name}</span>
            </div>

            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                    {syncSeparatorConfig[mapping.direction]}
                </Badge>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{destinationTable?.name}</span>
                <img
                    src={getImagePath(destinationTable?.icon)}
                    alt={destinationTable?.name}
                    className="w-4 h-4 object-contain"
                />
            </div>
        </div>
    );
}; 