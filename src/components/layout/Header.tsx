
import { Bell, Search, Command } from "lucide-react";
import { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

const Header = ({ children }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        {children}
        <div className="relative max-w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-muted-foreground" />
          </div>
          <input 
            type="text" 
            className="bg-secondary/50 border-none rounded-md pl-10 pr-4 py-2 w-full text-sm placeholder:text-muted-foreground"
            placeholder="Search syncs..." 
          />
          <div className="hidden md:flex absolute inset-y-0 right-0 items-center pr-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Command size={14} /> K
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 rounded-md text-muted-foreground hover:bg-secondary relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button className="bg-primary hover:bg-primary/90 text-white px-3 py-2 md:px-4 md:py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">
          + New Sync
        </button>
      </div>
    </header>
  );
};

export default Header;
