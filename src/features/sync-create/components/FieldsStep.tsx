import React from 'react';
import FieldMapperItem from '../components/FieldMapperItem';

interface Field {
  name: string;
  type: string;
}

interface FieldsStepProps {
  sourceFields: Field[];
  destinationFields: Field[];
}

const FieldsStep: React.FC<FieldsStepProps> = ({ sourceFields, destinationFields }) => {
  const handleAutoMap = () => {
    // Implement auto-mapping logic here
  };

  const handleClearAll = () => {
    // Implement clear all mappings logic here
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="mb-4 pb-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Field Mapping</h3>
          <div className="flex items-center gap-2">
            <button 
              className="text-sm text-primary hover:underline"
              onClick={handleAutoMap}
            >
              Auto-map fields
            </button>
            <button 
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
              onClick={handleClearAll}
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {sourceFields.map((sourceField, index) => (
          <FieldMapperItem 
            key={sourceField.name}
            sourceField={sourceField}
            destinationField={destinationFields[index] || { name: "", type: "" }}
            mapped={index < 5}
          />
        ))}
      </div>
    </div>
  );
};

export default FieldsStep; 