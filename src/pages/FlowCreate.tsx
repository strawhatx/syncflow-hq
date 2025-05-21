
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import StepperHeader from "../components/flows/StepperHeader";
import FieldMapperItem from "../components/flows/FieldMapperItem";

const steps = [
  { id: 0, title: "Source", description: "Select a data source" },
  { id: 1, title: "Destination", description: "Select where to send data" },
  { id: 2, title: "Entity", description: "Choose what to sync" },
  { id: 3, title: "Fields", description: "Map data fields" },
  { id: 4, title: "Direction", description: "Configure sync direction" },
];

// Mock source fields
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

// Mock destination fields
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

const integrations = [
  { 
    name: "Shopify", 
    icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png",
    description: "Your e-commerce storefront"
  },
  { 
    name: "Airtable", 
    icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png",
    description: "Spreadsheet-database hybrid"
  },
  { 
    name: "Notion", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    description: "All-in-one workspace"
  },
  { 
    name: "Klaviyo", 
    icon: "https://cdn.worldvectorlogo.com/logos/klaviyo-1.svg",
    description: "Customer data platform"
  },
];

const entityTypes = [
  { id: "products", name: "Products", description: "Your store's products, variants, and inventory" },
  { id: "orders", name: "Orders", description: "Customer orders and line items" },
  { id: "customers", name: "Customers", description: "Customer information and attributes" },
  { id: "collections", name: "Collections", description: "Product collections and categories" },
];

const FlowCreate = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [syncDirection, setSyncDirection] = useState<"one-way" | "two-way">("one-way");
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <div 
                key={integration.name}
                className={`bg-white rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
                  selectedSource === integration.name
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/40"
                }`}
                onClick={() => setSelectedSource(integration.name)}
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                    <img 
                      src={integration.icon} 
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
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter(i => i.name !== selectedSource)
              .map((integration) => (
                <div 
                  key={integration.name}
                  className={`bg-white rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
                    selectedDestination === integration.name
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                  onClick={() => setSelectedDestination(integration.name)}
                >
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                      <img 
                        src={integration.icon} 
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
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entityTypes.map((entity) => (
              <div 
                key={entity.id}
                className={`bg-white rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
                  selectedEntity === entity.id
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/40"
                }`}
                onClick={() => setSelectedEntity(entity.id)}
              >
                <h3 className="font-medium mb-2">{entity.name}</h3>
                <p className="text-sm text-muted-foreground">{entity.description}</p>
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="mb-4 pb-4 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Field Mapping</h3>
                <div className="flex items-center gap-2">
                  <button className="text-sm text-primary hover:underline">Auto-map fields</button>
                  <button className="text-sm text-muted-foreground hover:text-foreground hover:underline">Clear all</button>
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
      case 4:
        return (
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-medium mb-4">Sync Direction</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                  syncDirection === "one-way"
                    ? "border-primary ring-1 ring-primary bg-accent"
                    : "border-border hover:border-primary/40"
                }`}
                onClick={() => setSyncDirection("one-way")}
              >
                <div className="flex items-center justify-center mb-4 text-primary">
                  <div className="p-2 rounded-full bg-accent">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <h4 className="font-medium text-center mb-2">One-way Sync</h4>
                <p className="text-sm text-muted-foreground text-center">
                  Data flows from source to destination only
                </p>
              </div>
              
              <div 
                className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                  syncDirection === "two-way"
                    ? "border-primary ring-1 ring-primary bg-accent"
                    : "border-border hover:border-primary/40"
                }`}
                onClick={() => setSyncDirection("two-way")}
              >
                <div className="flex items-center justify-center mb-4 text-primary">
                  <div className="p-2 rounded-full bg-accent">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 8L21 12M21 12L17 16M21 12H3M7 16L3 12M3 12L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <h4 className="font-medium text-center mb-2">Two-way Sync</h4>
                <p className="text-sm text-muted-foreground text-center">
                  Data flows in both directions with conflict resolution
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border">
              <h4 className="font-medium mb-2">Conflict Resolution</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Choose how to handle conflicting changes when the same record is modified in both systems.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="radio" id="source" name="conflict" className="mr-2" defaultChecked />
                  <label htmlFor="source" className="text-sm">Source wins (Shopify takes precedence)</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="destination" name="conflict" className="mr-2" />
                  <label htmlFor="destination" className="text-sm">Destination wins (Airtable takes precedence)</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="latest" name="conflict" className="mr-2" />
                  <label htmlFor="latest" className="text-sm">Latest change wins (Based on timestamp)</label>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
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
          className="px-4 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Previous
        </button>
        
        <button 
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
          onClick={currentStep === steps.length - 1 ? () => alert("Flow created!") : handleNext}
        >
          {currentStep === steps.length - 1 ? "Create Flow" : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default FlowCreate;
