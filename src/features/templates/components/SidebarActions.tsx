import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TemplateCategory } from "@/integrations/supabase/types";

interface SidebarActionsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: TemplateCategory[];
}

const SidebarActions = ({ activeCategory, onCategoryChange, categories }: SidebarActionsProps) => {
  const allCategories = [
    { id: "all", name: "All Templates" },
    ...categories
  ];

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-foreground text-base font-medium">
            Templates
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Unreads</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <SidebarInput placeholder="Type to search..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {allCategories.map(category => (
              <button
                key={category.id}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeCategory === category.id
                    ? "bg-accent text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SidebarActions; 