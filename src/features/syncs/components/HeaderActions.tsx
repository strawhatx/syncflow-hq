import { memo } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderActionsProps {
  search: string;
  setSearch: (v: string) => void;
  onCreate: () => void;
  isCreating: boolean;
}

const HeaderActions = memo(({ search, setSearch, onCreate, isCreating }: HeaderActionsProps) => (
  <div className="flex items-center gap-2">
    <div className="relative w-64">
      <input
        type="text"
        className="w-full pl-6 pr-2 py-1 text-sm rounded border border-border bg-background"
        placeholder="Search syncs..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <Search className="absolute left-1.5 top-1.5 text-muted-foreground" size={14} />
    </div>
    <Button onClick={onCreate} disabled={isCreating} size="sm" className="h-8">
      <Plus size={14} className="mr-1" />
      {isCreating ? "Creating..." : "New Sync"}
    </Button>
  </div>
));

export default HeaderActions; 