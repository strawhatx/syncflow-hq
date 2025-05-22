import { NavLink } from "react-router-dom";
import {
  ChevronRight,
  LayoutDashboard,
  Activity,
  Cog,
  Zap,
  Box,
  Database,
  Clock,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { memo } from "react";

interface SidebarProps {
  onNavItemClick?: () => void;
}

interface SubMenuItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  path: string;
  icon: JSX.Element;
  submenu?: SubMenuItem[];
}

// Define navigation items outside component to prevent recreation on each render
const NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} />
  },
  {
    name: "Syncs",
    path: "/syncs",
    icon: <Activity size={18} />,
    submenu: [
      { name: "Create Sync", path: "/syncs/create" },
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
    name: "Profile",
    path: "/profile",
    icon: <User size={18} />
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <Cog size={18} />
  },
] as const;

// Memoized navigation item component
const NavItem = memo(({
  item,
  onNavItemClick
}: {
  item: NavItem;
  onNavItemClick?: () => void;
}) => (
  <SidebarMenuItem key={item.name}>
    <SidebarMenuButton asChild>
      <NavLink
        to={item.path}
        end={!item.submenu}
        onClick={onNavItemClick}
        className={({ isActive }) => isActive ? "flex items-center gap-3 px-8 py-2 rounded-md hover:bg-muted transition-colors data-[active=true]" : "flex items-center gap-3 px-8 py-2 rounded-md hover:bg-muted transition-colors"}
      >

        {item.icon}
        <span>{item.name}</span>
        {item.submenu && <ChevronRight size={16} className="ml-auto" />}

      </NavLink>
    </SidebarMenuButton>


    {item.submenu && (
      <div className="pl-9 mt-1 space-y-1">
        {item.submenu.map((subitem) => (
          <NavLink
            key={subitem.name}
            to={subitem.path}
            onClick={onNavItemClick}
            className={({ isActive }) => isActive ? "data-[active=true]" : ""}
          >
            <SidebarMenuButton size="sm">
              {subitem.name}
            </SidebarMenuButton>
          </NavLink>
        ))}
      </div>
    )}
  </SidebarMenuItem>
));

NavItem.displayName = 'NavItem';

// Memoized user profile component
const UserProfile = memo(({ user }: { user: { email?: string } }) => (
  <SidebarMenuItem className="list-none border-t px-4 py-3">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        {user?.email?.charAt(0).toUpperCase() || "U"}
      </div>
      <div className="text-sm">
        <div className="font-medium truncate max-w-[170px]">{user?.email || "User"}</div>
        <div className="text-xs text-muted-foreground">Pro Plan</div>
      </div>
    </div>
  </SidebarMenuItem>
));
UserProfile.displayName = 'UserProfile';

const Sidebar = ({ onNavItemClick }: SidebarProps) => {
  const { signOut, user } = useAuth();

  return (
    <ShadcnSidebar>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 font-semibold text-xl p-4">
          <Zap size={24} className="text-primary" />
          <span>SyncStack</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              onNavItemClick={onNavItemClick}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <UserProfile user={user} />

        <SidebarMenuItem className="list-none border-t px-4 py-3">
          <Button
            onClick={signOut}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </SidebarMenuItem>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default memo(Sidebar);
