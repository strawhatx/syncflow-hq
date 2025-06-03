import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StepperHeader from "@/components/syncs/StepperHeader";
import ConnectionStep from "./components/ConnectionStep";
import EntityStep from "./components/EntityStep";
import FieldsStep from "./components/FieldsStep";
import DirectionStep from "./components/DirectionStep";
import IntegrationConnectModal from "@/features/integration-connect/components/IntegrationConnectModal";

const steps = [
  { id: 0, title: "Connections", description: "Select source and destination" },
  { id: 1, title: "Entity", description: "Choose what to sync" },
  { id: 2, title: "Fields", description: "Map data fields" },
  { id: 3, title: "Direction", description: "Configure sync direction" },
];

// Mock source fields - In a real app, these would come from the source integration
const sourceFields = [
  { name: "id", type: "string" },
  { name: "title", type: "string" },
  { name: "description", type: "text" },
  { name: "price", type: "number" },
  { name: "inventory_quantity", type: "number" },
  { name: "tags", type: "array" },
  { name: "images", type: "array" },
  { name: "created_at", type: "datetime" },
  { name: "updated_at", type: "datetime" },
];

// Mock destination fields - In a real app, these would come from the destination integration
const destinationFields = [
  { name: "ID", type: "string" },
  { name: "Name", type: "string" },
  { name: "Description", type: "text" },
  { name: "Price", type: "number" },
  { name: "Stock", type: "number" },
  { name: "Tags", type: "multiple select" },
  { name: "Images", type: "attachments" },
  { name: "Creation Date", type: "date" },
  { name: "Last Modified", type: "date" },
];

const SyncCreate = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedSourceConnection, setSelectedSourceConnection] = useState<string | null>(null);
  const [selectedDestinationConnection, setSelectedDestinationConnection] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [syncDirection, setSyncDirection] = useState<"one-way" | "two-way">("one-way");
  const [conflictResolution, setConflictResolution] = useState<"source" | "destination" | "latest">("latest");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectIntegration, setConnectIntegration] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  
  const createSyncMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: sync, error: syncError } = await supabase
        .from('syncs')
        .insert({
          name: "New Sync",
          user_id: user.id,
          source_integration_id: selectedSource,
          destination_integration_id: selectedDestination,
          entity_type: selectedEntity,
          sync_direction: syncDirection,
          conflict_resolution: conflictResolution,
        })
        .select()
        .single();

      if (syncError) throw syncError;

      // Create field mappings
      const fieldMappings = sourceFields.map((sourceField, index) => ({
        sync_id: sync.id,
        source_field_name: sourceField.name,
        source_field_type: sourceField.type,
        destination_field_name: destinationFields[index]?.name || "",
        destination_field_type: destinationFields[index]?.type || "",
      }));

      const { error: mappingsError } = await supabase
        .from('field_mappings')
        .insert(fieldMappings);

      if (mappingsError) throw mappingsError;

      return sync;
    },
  });
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      createSyncMutation.mutate();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleCreateNewConnection = (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    setConnectIntegration(integration);
    setShowConnectModal(true);
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ConnectionStep
            selectedSource={selectedSource}
            selectedDestination={selectedDestination}
            selectedSourceConnection={selectedSourceConnection}
            selectedDestinationConnection={selectedDestinationConnection}
            onSourceSelect={setSelectedSource}
            onDestinationSelect={setSelectedDestination}
            onSourceConnectionSelect={setSelectedSourceConnection}
            onDestinationConnectionSelect={setSelectedDestinationConnection}
            onCreateNewConnection={handleCreateNewConnection}
            setIntegrations={setIntegrations}
          />
        );
      case 1:
        return (
          <EntityStep
            selectedEntity={selectedEntity}
            onEntitySelect={setSelectedEntity}
          />
        );
      case 2:
        return (
          <FieldsStep
            sourceFields={sourceFields}
            destinationFields={destinationFields}
          />
        );
      case 3:
        return (
          <DirectionStep
            syncDirection={syncDirection}
            onDirectionChange={setSyncDirection}
            conflictResolution={conflictResolution}
            onConflictResolutionChange={setConflictResolution}
          />
        );
      default:
        return null;
    }
  };
  
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !!selectedSource && !!selectedDestination && !!selectedSourceConnection && !!selectedDestinationConnection;
      case 1:
        return !!selectedEntity;
      case 2:
        return true; // Field mapping is optional
      case 3:
        return true; // Direction is always valid
      default:
        return false;
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <button 
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back</span>
        </button>
      </div>
      
      <StepperHeader steps={steps} currentStep={currentStep} />
      
      <div className="mb-8">
        {renderStepContent()}
      </div>
      
      <div className="flex justify-between">
        <button 
          className="px-3 py-1.5 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Previous
        </button>
        
        <button 
          className="px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={!isStepValid() || createSyncMutation.isPending}
        >
          {currentStep === steps.length - 1 
            ? createSyncMutation.isPending 
              ? "Creating..." 
              : "Create Sync"
            : "Continue"}
        </button>
      </div>
      {showConnectModal && connectIntegration && (
        <IntegrationConnectModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          integration={connectIntegration}
        />
      )}
    </div>
  );
};

export default SyncCreate;