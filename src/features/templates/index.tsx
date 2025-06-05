import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import TemplateCard from "./components/TemplateCard";
import SidebarActions from "./components/SidebarActions";
import TemplatesSkeleton from "./components/TemplatesSkeleton";
import NoResults from "./components/NoResults";
import { useTemplates } from "./hooks/useTemplates";
import { useToast } from "@/hooks/use-toast";

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
    const { templates, categories, loading, error } = useTemplates();
    const { toast } = useToast();

    const filteredTemplates = templates.filter(template => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = activeCategory === "all" || template.category_id === activeCategory;

        return matchesSearch && matchesCategory;
    });

    // Effect for showing error toast
    useEffect(() => {
        if (error) {
            toast({
                title: "Error",
                description: `Error loading templates: ${error}`,
                variant: "destructive",
            });
        }
    }, [error, toast]);

    if (loading) {
        return <TemplatesSkeleton />;
    }

    return (

        <div className="flex flex-col md:flex-row gap-6 mb-8">
           <SidebarActions
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categories={categories}
        />

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

                {filteredTemplates.length === 0 ? (
                    <NoResults />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map(template => (
                            <TemplateCard
                                key={template.id}
                                title={template.name}
                                description={template.description || ""}
                                source={{
                                    name: template.source_integration.name,
                                    icon: template.source_integration.icon || ""
                                }}
                                destination={{
                                    name: template.destination_integration.name,
                                    icon: template.destination_integration.icon || ""
                                }}
                                direction={template.sync_direction}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Templates;
