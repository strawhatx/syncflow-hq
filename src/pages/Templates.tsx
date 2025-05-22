
import { useState } from "react";
import { Search } from "lucide-react";
import TemplateCard from "../components/templates/TemplateCard";

// Mock data for templates
const allTemplates = [
  {
    id: "1",
    title: "Products to Airtable",
    description: "Sync all products and inventory data to Airtable for team collaboration",
    source: {
      name: "Shopify",
      icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png"
    },
    destination: {
      name: "Airtable",
      icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png"
    },
    direction: "one-way" as const,
    category: "product"
  },
  {
    id: "2",
    title: "Orders to Notion",
    description: "Track all orders in a Notion database with automatic updates",
    source: {
      name: "Shopify",
      icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png"
    },
    destination: {
      name: "Notion",
      icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
    },
    direction: "one-way" as const,
    category: "order"
  },
  {
    id: "3",
    title: "Customers to Klaviyo",
    description: "Sync customer data for advanced email marketing automation",
    source: {
      name: "Shopify",
      icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png"
    },
    destination: {
      name: "Klaviyo",
      icon: "https://cdn.worldvectorlogo.com/logos/klaviyo-1.svg"
    },
    direction: "one-way" as const,
    category: "customer"
  },
  {
    id: "4",
    title: "Bidirectional Inventory",
    description: "Keep inventory in sync between Shopify and Airtable in real-time",
    source: {
      name: "Shopify",
      icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png"
    },
    destination: {
      name: "Airtable",
      icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png"
    },
    direction: "two-way" as const,
    category: "product"
  },
  {
    id: "5",
    title: "Collections to Notion",
    description: "Keep product collections and categories organized in Notion",
    source: {
      name: "Shopify",
      icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png"
    },
    destination: {
      name: "Notion",
      icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
    },
    direction: "one-way" as const,
    category: "collection"
  },
  {
    id: "6",
    title: "Customer Tags Sync",
    description: "Synchronize customer tags between Shopify and Klaviyo",
    source: {
      name: "Shopify",
      icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png"
    },
    destination: {
      name: "Klaviyo",
      icon: "https://cdn.worldvectorlogo.com/logos/klaviyo-1.svg"
    },
    direction: "two-way" as const,
    category: "customer"
  },
];

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  const categories = [
    { id: "all", name: "All Templates" },
    { id: "product", name: "Products" },
    { id: "order", name: "Orders" },
    { id: "customer", name: "Customers" },
    { id: "collection", name: "Collections" },
  ];
  
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || template.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Templates</h1>
        <p className="text-muted-foreground">Pre-built syncs to connect your e-commerce tools</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-64 space-y-1">
          {categories.map(category => (
            <button
              key={category.id}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                activeCategory === category.id
                  ? "bg-accent text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="flex-1">
          <div className="mb-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-muted-foreground" />
              </div>
              <input 
                type="text" 
                className="bg-white border border-border rounded-md pl-10 pr-4 py-2 w-full text-sm placeholder:text-muted-foreground"
                placeholder="Search templates..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                title={template.title}
                description={template.description}
                source={template.source}
                destination={template.destination}
                direction={template.direction}
              />
            ))}
            
            {filteredTemplates.length === 0 && (
              <div className="col-span-3 py-12 text-center">
                <p className="text-muted-foreground">No templates found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;
