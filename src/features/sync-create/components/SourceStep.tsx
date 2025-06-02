import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Integration {
  id: string;
  name: string;
  icon_url: string;
  description: string;
}

interface SourceStepProps {
  selectedSource: string | null;
  onSourceSelect: (source: string) => void;
}

const SourceStep: React.FC<SourceStepProps> = ({ selectedSource, onSourceSelect }) => {
  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading integrations...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {integrations?.map((integration) => (
        <div 
          key={integration.id}
          className={`bg-white rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
            selectedSource === integration.id
              ? "border-primary ring-1 ring-primary"
              : "border-border hover:border-primary/40"
          }`}
          onClick={() => onSourceSelect(integration.id)}
        >
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
              <img 
                src={integration.icon_url} 
                alt={integration.name} 
                className="h-8 w-8" 
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/32")} 
              />
            </div>
            <div className="ml-4">
              <h3 className="font-medium">{integration.name}</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{integration.description}</p>
        </div>
      ))}
    </div>
  );
};

export default SourceStep; 