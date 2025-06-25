// steps/NameStep.tsx
import { useState } from 'react';
import { useWizard } from '@/contexts/WizardContext';

export default function ConnectStep({ next, back }) {
  const [name, setName] = useState('');
  const { data, setData } = useWizard()

  const handleNext = async () => {
    //await saveStepData('name', { name });
    next(); // move to next step
  };

  const handleBack = async () => {
    back(); // move to next step
  };
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">What's your name?</h2>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Full name"
        className="border p-2 rounded w-full"
      />
      <div className="mt-4">
        <button
            onClick={handleBack}
            disabled={!name}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>  
          <button
            onClick={handleNext}
            disabled={!name}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
          
      </div>
    </div>
  );
}
