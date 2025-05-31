import { Plus, Search, Loader2 } from "lucide-react";
import IntegrationCard from "./components/IntegrationCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIntegrations, categories } from "./hooks/useIntegrations";

const Integrations = () => {
  const navigate = useNavigate();
  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    connectedIntegrations,
    availableIntegrations,
    isLoading,
    error
  } = useIntegrations();

  const handleConnect = (integrationId: string) => {
    navigate(`/integrations/${integrationId}/connect`);
  };
  
  const handleManage = (connectionId: string) => {
    navigate(`/connections/${connectionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Error loading integrations</h2>
        <p className="text-muted-foreground">There was a problem loading your integrations. Please try again.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Integrations</h1>
        <p className="text-muted-foreground">Connect your tools to enable data synchronization</p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="mb-8 border-b border-border">
        <div className="flex space-x-1 overflow-x-auto pb-px">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                category.id === activeCategory
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {connectedIntegrations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Connected</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedIntegrations.map(integration => (
              <IntegrationCard
                key={integration.id}
                name={integration.name}
                icon={integration.icon}
                description={integration.description}
                isConnected={true}
                connections={integration.connections}
                onConnect={() => handleConnect(integration.id)}
                onManage={handleManage}
              />
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-lg font-medium mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableIntegrations.map(integration => (
            <IntegrationCard
              key={integration.id}
              name={integration.name}
              icon={integration.icon}
              description={integration.description}
              isConnected={false}
              connections={[]}
              onConnect={() => handleConnect(integration.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;
