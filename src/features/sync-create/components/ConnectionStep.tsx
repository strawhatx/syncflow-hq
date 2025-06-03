import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import * as Select from '@radix-ui/react-select';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Connection {
  id: string;
  connection_name: string;
  connection_status: string;
  integration_id: string;
  user_id: string;
  api_key: string | null;
  auth_data: any | null;
  created_at: string;
  updated_at: string;
}

interface ConnectionStepProps {
  selectedSource: string | null;
  selectedDestination: string | null;
  selectedSourceConnection: string | null;
  selectedDestinationConnection: string | null;
  onSourceSelect: (source: string) => void;
  onDestinationSelect: (destination: string) => void;
  onSourceConnectionSelect: (connection: string) => void;
  onDestinationConnectionSelect: (connection: string) => void;
}

const ConnectionStep: React.FC<ConnectionStepProps> = ({
  selectedSource,
  selectedDestination,
  selectedSourceConnection,
  selectedDestinationConnection,
  onSourceSelect,
  onDestinationSelect,
  onSourceConnectionSelect,
  onDestinationConnectionSelect,
}) => {
  // Fetch integrations
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery<Integration[]>({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch source connections
  const { data: sourceConnections, isLoading: isLoadingSourceConnections } = useQuery<Connection[]>({
    queryKey: ['connections', selectedSource],
    queryFn: async () => {
      if (!selectedSource) return [];
      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('integration_id', selectedSource);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSource,
  });

  // Fetch destination connections
  const { data: destinationConnections, isLoading: isLoadingDestinationConnections } = useQuery<Connection[]>({
    queryKey: ['connections', selectedDestination],
    queryFn: async () => {
      if (!selectedDestination) return [];
      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('integration_id', selectedDestination);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDestination,
  });

  // Memoize filtered integrations for destination
  const filteredIntegrations = useMemo(() => {
    if (!integrations) return [];
    return integrations.filter(integration => integration.id !== selectedSource);
  }, [integrations, selectedSource]);

  // Loading state component
  const LoadingState = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  // Custom Select Component
  const CustomSelect = ({
    value,
    onValueChange,
    options,
    placeholder,
    disabled,
    isLoading,
    onCreateNew,
  }: {
    value: string | null;
    onValueChange: (value: string) => void;
    options: { id: string; name: string; icon?: string }[];
    placeholder: string;
    disabled?: boolean;
    isLoading: boolean;
    onCreateNew?: () => void;
  }) => {
    // Function to resolve image paths
    const getImagePath = (icon_name: string) => {
      if (!icon_name) return;
      return `/svg/${icon_name}.svg`;
    };

    if (isLoading) return <LoadingState />;

    return (
      <Select.Root value={value || ''} onValueChange={onValueChange} disabled={disabled}>
        <Select.Trigger
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            {value && options.find(opt => opt.id === value)?.icon && (
              <img
                src={getImagePath(options.find(opt => opt.id === value)?.icon || '')}
                alt={options.find(opt => opt.id === value)?.name || ''}
                className="h-3.5 w-3.5 object-contain"
              />
            )}
            <Select.Value placeholder={placeholder}>
              {value && options.find(opt => opt.id === value)?.name}
            </Select.Value>
          </div>
          <Select.Icon>
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="relative z-50 min-w-[200px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          >
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.id}
                  value={option.id}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-7 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    value === option.id && "bg-accent text-accent-foreground"
                  )}
                >
                  {option.icon && (
                    <img
                      src={getImagePath(option.icon)}
                      alt={option.name}
                      className="absolute left-2 h-3.5 w-3.5 object-contain"
                    />
                  )}
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Select.ItemIndicator>
                      <Check className="h-3.5 w-3.5" />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>{option.name}</Select.ItemText>
                </Select.Item>
              ))}
              {onCreateNew && (
                <Select.Item
                  value="create-new"
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-7 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 border-t mt-1"
                  onSelect={(e) => {
                    e.preventDefault();
                    onCreateNew();
                  }}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                  <Select.ItemText>Create new connection</Select.ItemText>
                </Select.Item>
              )}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  };

  // Integration selector component
  const IntegrationSelector = ({
    title,
    value,
    onChange,
    options,
    disabled,
    isLoading,
  }: {
    title: string;
    value: string | null;
    onChange: (value: string) => void;
    options: Integration[];
    disabled?: boolean;
    isLoading: boolean;
  }) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <CustomSelect
        value={value}
        onValueChange={onChange}
        options={options}
        placeholder="Select an integration"
        disabled={disabled}
        isLoading={isLoading}
      />
    </div>
  );

  // Connection selector component
  const ConnectionSelector = ({
    title,
    value,
    onChange,
    connections,
    isLoading,
    onCreateNew,
  }: {
    title: string;
    value: string | null;
    onChange: (value: string) => void;
    connections: Connection[] | undefined;
    isLoading: boolean;
    onCreateNew: () => void;
  }) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {isLoading ? (
        <LoadingState />
      ) : (
        <div>
          <CustomSelect
            value={value}
            onValueChange={onChange}
            options={connections?.map(conn => ({
              id: conn.id,
              name: conn.connection_name,
            })) || []}
            placeholder="Select a connection"
            isLoading={isLoading}
            onCreateNew={onCreateNew}
          />
        </div>
      )}
    </div>
  );

  if (isLoadingIntegrations) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Source Section */}
      <div className="w-full md:w-[45%] space-y-4">
        <IntegrationSelector
          title="Source Integration"
          value={selectedSource}
          onChange={onSourceSelect}
          options={integrations || []}
          isLoading={isLoadingIntegrations}
        />

        {selectedSource && (
          <ConnectionSelector
            title="Source Connection"
            value={selectedSourceConnection}
            onChange={onSourceConnectionSelect}
            connections={sourceConnections}
            isLoading={isLoadingSourceConnections}
            onCreateNew={() => {/* TODO: Implement new connection flow */}}
          />
        )}
      </div>

      {/* Connection Icon */}
      <div className="hidden md:flex items-center justify-center w-[10%]">
        <div className="w-[1px] h-24 bg-border" />
      </div>

      {/* Destination Section */}
      <div className="w-full md:w-[45%] space-y-4">
        <IntegrationSelector
          title="Destination Integration"
          value={selectedDestination}
          onChange={onDestinationSelect}
          options={filteredIntegrations}
          isLoading={isLoadingIntegrations}
        />

        {selectedDestination && (
          <ConnectionSelector
            title="Destination Connection"
            value={selectedDestinationConnection}
            onChange={onDestinationConnectionSelect}
            connections={destinationConnections}
            isLoading={isLoadingDestinationConnections}
            onCreateNew={() => {/* TODO: Implement new connection flow */}}
          />
        )}
      </div>
    </div>
  );
};

export default ConnectionStep; 