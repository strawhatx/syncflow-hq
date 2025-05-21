
import { NavLink } from "react-router-dom";
import { 
  ChevronRight, 
  LayoutDashboard, 
  Activity, 
  Cog, 
  Zap, 
  Box, 
  Database, 
  Clock 
} from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { 
      name: "Dashboard", 
      path: "/dashboard", 
      icon: <LayoutDashboard size={18} /> 
    },
    { 
      name: "Flows", 
      path: "/flows", 
      icon: <Activity size={18} />,
      submenu: [
        { name: "Create Flow", path: "/flows/create" },
        { name: "Active Flows", path: "/flows/active" },
      ] 
    },
    { 
      name: "Templates", 
      path: "/templates", 
      icon: <Box size={18} /> 
    },
    { 
      name: "Integrations", 
      path: "/integrations", 
      icon: <Database size={18} /> 
    },
    { 
      name: "Logs", 
      path: "/logs", 
      icon: <Clock size={18} /> 
    },
    { 
      name: "Settings", 
      path: "/settings", 
      icon: <Cog size={18} /> 
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 font-semibold text-xl">
          <Zap size={24} className="text-primary" />
          <span>SyncStack</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.name} className="mb-1">
            <NavLink 
              to={item.path}
              end={!item.submenu}
              className={({ isActive }) => 
                `sidebar-item ${isActive ? "sidebar-item-active" : "sidebar-item-inactive"}`
              }
            >
              {item.icon}
              <span>{item.name}</span>
              {item.submenu && <ChevronRight size={16} className="ml-auto" />}
            </NavLink>
            
            {item.submenu && (
              <div className="pl-9 mt-1 space-y-1">
                {item.submenu.map((subitem) => (
                  <NavLink
                    key={subitem.name}
                    to={subitem.path}
                    className={({ isActive }) => 
                      `sidebar-item text-xs ${isActive ? "sidebar-item-active" : "sidebar-item-inactive"}`
                    }
                  >
                    {subitem.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            MS
          </div>
          <div className="text-sm">
            <div className="font-medium">Your Workspace</div>
            <div className="text-xs text-muted-foreground">Pro Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
