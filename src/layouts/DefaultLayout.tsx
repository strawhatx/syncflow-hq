
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { useIsMobile } from "../hooks/use-mobile";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DefaultLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // For mobile: sheet with sidebar
  if (isMobile) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarProvider defaultOpen={true}>
              <Sidebar onNavItemClick={() => setSidebarOpen(false)} />
            </SidebarProvider>
          </SheetContent>
          <div className="flex-1 flex flex-col">
            <Header>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
            </Header>
            <main className="flex-1 px-4 py-6 md:px-6 md:py-8 overflow-auto">
              <Outlet />
            </main>
          </div>
        </Sheet>
      </div>
    );
  }

  // For desktop: collapsible sidebar
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
            <div className="flex items-center gap-2">
              <Separator orientation="vertical" className="h-4" />
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DefaultLayout;
