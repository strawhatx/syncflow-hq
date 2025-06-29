
import { useWizard } from '@/contexts/WizardContext';
import { Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TableMappingStep({ next }) {
  const { data, setData } = useWizard();

  const handleNext = async () => {
    // nothing to save until we we get to the connection step
    next(); // move to next step
  };

  return (
    <div>
      <div className="grid items-center grid-cols-1 md:grid-cols-5 gap-4">
        <div className='col-span-2'>
          source tables
        </div>

        <div className='flex items-center justify-center col-span-1'>
          <Link className='w-4 h-4' />
        </div>
        <div className='col-span-2'>
          destination tables
        </div>
      </div>
      <div className="mt-4">
        <Button
          onClick={handleNext}
          disabled={!data.source.connector_id || !data.destination.connector_id}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
