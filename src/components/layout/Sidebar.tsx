import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Activity,
  BarChart2,
  Box,
  ChevronsUpDown,
  Clock,
  Command,
  Database,
  Import,
  LayoutDashboard,
  LogOut,
  Zap
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "../ui/button";

const Sidebar = () => {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const navigationItems = useMemo(
    () => [
      { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
      { title: "Syncs", icon: Activity, url: "/syncs" },
      { title: "Templates", icon: Box, url: "/templates" },
      { title: "Integrations", icon: Database, url: "/integrations" },
      { title: "Logs", icon: Clock, url: "/logs" },
    ],
    []
  );

  const NavItem = ({
    title,
    icon: Icon,
    url,
    badge,
  }: {
    title: string;
    icon: React.ElementType;
    url: string;
    badge?: number;
  }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={title}>
        <Link
          to={url}
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors"
        >
          <Icon className="w-5 h-5" />
          <span>{title}</span>
          {badge !== undefined && (
            <Badge variant="secondary" className="ml-auto bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
              {badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const avatarUrl = profile?.avatar || "";
  const avatarFallback = profile?.avatar_backup || "NA";
  const fullName = profile?.full_name || "Anonymous";
  const email = profile?.email || "Not available";

  return (
    <ShadcnSidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SyncStack</span>
                  <span className="truncate text-xs">PRO</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <NavItem key={item.title} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Select Account + Profile */}
      <SidebarFooter>
        <SidebarMenu className="flex flex-col gap-2">
          <SidebarMenuButton
            size="lg"
            onClick={() => navigate("/settings")}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0  text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              <LogOut size={16} className="size-4" />
            </div>

            <span>Sign Out</span>
          </SidebarMenuButton>

          <SidebarMenuButton
            size="lg"
            onClick={() => navigate("/settings")}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{fullName}</span>
              <span className="truncate text-xs">{email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar;
