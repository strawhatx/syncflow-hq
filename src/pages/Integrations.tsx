import { useState } from "react";
import { Plus, Search } from "lucide-react";
import IntegrationCard, { Connection, ConnectionStatus } from "../components/integrations/IntegrationCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Mock data for integrations
const integrations = [
  {
    id: "1",
    name: "Shopify",
    icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png",
    description: "Connect your Shopify store to sync products, orders, and customers",
    connections: [
      { id: "conn1", name: "My Store", status: "active" as ConnectionStatus },
      { id: "conn2", name: "Test Store", status: "error" as ConnectionStatus }
    ],
    category: "commerce"
  },
  {
    id: "2",
    name: "Airtable",
    icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png",
    description: "Use Airtable as a powerful database for your e-commerce data",
    connections: [
      { id: "conn3", name: "Marketing Database", status: "active" as ConnectionStatus }
    ],
    category: "database"
  },
  {
    id: "3",
    name: "Notion",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    description: "Organize your e-commerce operations in Notion databases and pages",
    connections: [],
    category: "productivity"
  },
  {
    id: "4",
    name: "Klaviyo",
    icon: "https://cdn.worldvectorlogo.com/logos/klaviyo-1.svg",
    description: "Sync customer data with Klaviyo for better email marketing",
    connections: [],
    category: "marketing"
  },
  {
    id: "5",
    name: "BigCommerce",
    icon: "https://cdn.worldvectorlogo.com/logos/bigcommerce-1.svg",
    description: "Connect your BigCommerce store to sync products and orders",
    connections: [],
    category: "commerce"
  },
  {
    id: "6",
    name: "WooCommerce",
    icon: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg",
    description: "Sync your WooCommerce store data to other applications",
    connections: [],
    category: "commerce"
  },
  {
    id: "7",
    name: "Google Sheets",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
    description: "Use Google Sheets to store and manage your e-commerce data",
    connections: [],
    category: "database"
  },
  {
    id: "8",
    name: "Mailchimp",
    icon: "https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon.svg",
    description: "Keep customer data in sync with your Mailchimp lists",
    connections: [],
    category: "marketing"
  },
];

const categories = [
  { id: "all", name: "All Integrations" },
  { id: "commerce", name: "E-commerce Platforms" },
  { id: "database", name: "Databases" },
  { id: "marketing", name: "Marketing Tools" },
  { id: "productivity", name: "Productivity" },
];

const Integrations = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleConnect = (integrationId: string) => {
    navigate(`/integrations/${integrationId}/connect`);
  };
  
  const handleManage = (integrationId: string, connectionId: string) => {
    navigate(`/integrations/${integrationId}/connections/${connectionId}`);
  };

  const filteredIntegrations = integrations.filter(integration => {
    // Filter by category
    const categoryMatch = activeCategory === "all" || integration.category === activeCategory;
    
    // Filter by search query
    const searchMatch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  // Connected integrations have at least one connection
  const connectedIntegrations = filteredIntegrations.filter(integration => integration.connections.length > 0);
  
  // Available integrations have no connections
  const availableIntegrations = filteredIntegrations.filter(integration => integration.connections.length === 0);

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
                onManage={(connectionId) => handleManage(integration.id, connectionId)}
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
