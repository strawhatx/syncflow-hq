import { Outlet, useLocation } from "react-router-dom";
import { BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { BreadcrumbItem, BreadcrumbList, BreadcrumbLink, Breadcrumb } from "../components/ui/breadcrumb";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import Sidebar from "../components/layout/Sidebar";
import { useHeaderContent } from "@/contexts/HeaderContentContext";

// Sidebar Layout
interface BreadcrumbItem {
    name: string;
    href: string;
}

// Helper function to format path segment into readable text
const formatPathSegment = (segment: string): string => {
    return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Helper function to generate breadcrumbs from path
const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        breadcrumbs.push({
            name: formatPathSegment(segment),
            href: currentPath
        });
    });

    return breadcrumbs;
};

export const SidebarClosedLayout = () => {
    const location = useLocation();
    const breadcrumbs = generateBreadcrumbs(location.pathname);
    const { content } = useHeaderContent();

    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    {/* Breadcrumbs on the Left */}
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        {breadcrumbs.length > 0 && (
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {breadcrumbs.map((item, index) => (
                                        <BreadcrumbItem key={item.href} className={index === breadcrumbs.length - 1 ? "font-semibold" : ""}>
                                            {index === breadcrumbs.length - 1 ? (
                                                <BreadcrumbPage>{item.name}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                                            )}
                                            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                        </BreadcrumbItem>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        )}
                    </div>
                    <div>{content}</div>
                </header>

                {/* Main Content */}
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

