import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import TemplateCard from "./components/TemplateCard";
import SidebarActions from "./components/SidebarActions";
import TemplatesSkeleton from "./components/TemplatesSkeleton";
import NoResults from "./components/NoResults";
import { useHeaderContent } from "@/contexts/HeaderContentContext";
import { useTemplates } from "./hooks/useTemplates";
import { useToast } from "@/hooks/use-toast";

const Templates = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const { setContent } = useHeaderContent();
    const { templates, categories, loading, error } = useTemplates();
    const { toast } = useToast();

    const filteredTemplates = templates.filter(template => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = activeCategory === "all" || template.category_id === activeCategory;

        return matchesSearch && matchesCategory;
    });

    const sidebarContent = (
        <SidebarActions
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categories={categories}
        />
    );

    useEffect(() => {
        setContent(sidebarContent);
    }, [setContent, sidebarContent]);

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

    useEffect(() => {
        return () => { setContent(null) };
    }, [setContent]);

    if (loading) {
        return <TemplatesSkeleton />;
    }

    return (
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
    );
};

export default Templates;
