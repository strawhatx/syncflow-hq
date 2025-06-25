// steps/NameStep.tsx

import { useWizard } from '@/contexts/WizardContext';
import { fetchConnectors } from '@/services/connectorService';
import { useQuery } from '@tanstack/react-query';
import { CustomSelect } from '../helpers/CustomSelect';
import { Link } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AppStep({ next }) {
  const { data, setData } = useWizard();
  const { syncId } = useParams();
  const { data: connectors, isLoading, error } = useQuery({
    queryKey: ['connectors'],
    queryFn: fetchConnectors
  });

  const handleNext = async () => {
    // nothing to save until we we get to the connection step
    next(); // move to next step
  };

  return (
    <div>
      <div className="grid items-center grid-cols-1 md:grid-cols-5 gap-4">
        <div className='col-span-2'>
          <CustomSelect
            value={data.source_app_id}
            onValueChange={(value) => setData({ ...data, source_app_id: value })}
            options={connectors || []}
            placeholder={`Select source app`}
            disabled={false}
            isLoading={isLoading}
          />
        </div>

        <div className='flex items-center justify-center col-span-1'>
          <Link className='w-4 h-4' />
        </div>
        <div className='col-span-2'>
          <CustomSelect
            value={data.destination_app_id}
            onValueChange={(value) => setData({ ...data, destination_app_id: value })}
            options={connectors || []}
            placeholder={`Select source app`}
            disabled={false}
            isLoading={isLoading}
          />
        </div>
      </div>
      <div className="mt-4">
        <Button
          onClick={handleNext}
          disabled={!data.source_app_id || !data.destination_app_id}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
