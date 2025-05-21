
import IntegrationCard from "../components/integrations/IntegrationCard";

// Mock data for integrations
const integrations = [
  {
    id: "1",
    name: "Shopify",
    icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png",
    description: "Connect your Shopify store to sync products, orders, and customers",
    isConnected: true,
    category: "commerce"
  },
  {
    id: "2",
    name: "Airtable",
    icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png",
    description: "Use Airtable as a powerful database for your e-commerce data",
    isConnected: true,
    category: "database"
  },
  {
    id: "3",
    name: "Notion",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    description: "Organize your e-commerce operations in Notion databases and pages",
    isConnected: false,
    category: "productivity"
  },
  {
    id: "4",
    name: "Klaviyo",
    icon: "https://cdn.worldvectorlogo.com/logos/klaviyo-1.svg",
    description: "Sync customer data with Klaviyo for better email marketing",
    isConnected: false,
    category: "marketing"
  },
  {
    id: "5",
    name: "BigCommerce",
    icon: "https://cdn.worldvectorlogo.com/logos/bigcommerce-1.svg",
    description: "Connect your BigCommerce store to sync products and orders",
    isConnected: false,
    category: "commerce"
  },
  {
    id: "6",
    name: "WooCommerce",
    icon: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg",
    description: "Sync your WooCommerce store data to other applications",
    isConnected: false,
    category: "commerce"
  },
  {
    id: "7",
    name: "Google Sheets",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
    description: "Use Google Sheets to store and manage your e-commerce data",
    isConnected: false,
    category: "database"
  },
  {
    id: "8",
    name: "Mailchimp",
    icon: "https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon.svg",
    description: "Keep customer data in sync with your Mailchimp lists",
    isConnected: false,
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
  const handleConnect = () => {
    alert("Connect/Manage integration clicked");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Integrations</h1>
        <p className="text-muted-foreground">Connect your tools to enable data synchronization</p>
      </div>
      
      <div className="mb-8 border-b border-border">
        <div className="flex space-x-1 overflow-x-auto pb-px">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                category.id === "all"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Connected</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations
            .filter(integration => integration.isConnected)
            .map(integration => (
              <IntegrationCard
                key={integration.id}
                name={integration.name}
                icon={integration.icon}
                description={integration.description}
                isConnected={integration.isConnected}
                onConnect={handleConnect}
              />
            ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations
            .filter(integration => !integration.isConnected)
            .map(integration => (
              <IntegrationCard
                key={integration.id}
                name={integration.name}
                icon={integration.icon}
                description={integration.description}
                isConnected={integration.isConnected}
                onConnect={handleConnect}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;
