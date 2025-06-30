import { Outlet, useLocation } from "react-router-dom";
import { BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { BreadcrumbItem, BreadcrumbList, BreadcrumbLink, Breadcrumb } from "../components/ui/breadcrumb";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import Sidebar from "../components/layout/Sidebar";
import { useHeaderContent } from '@/contexts/HeaderContentContext';
import React from "react";

interface BreadcrumbItemType {
    name: string;
    href: string;
}

const formatPathSegment = (segment: string): string => {
    return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const generateBreadcrumbs = (pathname: string): BreadcrumbItemType[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItemType[] = [];
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

const SidebarLayout = () => {
    const location = useLocation();
    const breadcrumbs = generateBreadcrumbs(location.pathname);
    const { content } = useHeaderContent();

    return (
        <SidebarProvider defaultOpen>
            <Sidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        {breadcrumbs.length > 0 && (
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {breadcrumbs.map((item, index) => (
                                        <div key={item.href} className="flex items-center">
                                            <BreadcrumbItem className={index === breadcrumbs.length - 1 ? "font-semibold" : ""}>
                                                {index === breadcrumbs.length - 1 ? (
                                                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                        </div>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        )}
                    </div>
                    <div>{content}</div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default SidebarLayout; 