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
    <div className="md:w-64 space-y-1">
      {allCategories.map(category => (
        <button
          key={category.id}
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeCategory === category.id
            ? "bg-accent text-primary font-medium"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default SidebarActions; 