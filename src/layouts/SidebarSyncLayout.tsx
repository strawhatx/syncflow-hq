import { Outlet, useLocation, useParams, useNavigate } from "react-router-dom";
import { BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { BreadcrumbItem, BreadcrumbList, BreadcrumbLink, Breadcrumb } from "../components/ui/breadcrumb";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import Sidebar from "../components/layout/Sidebar";
import { useHeaderContent } from '@/contexts/HeaderContentContext';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const stepsConfig = {
    0: { label: "Connections", path: "connect" },
    1: { label: "Mappings", path: "mapping" },
    2: { label: "Authorize", path: "authorize" },
} as const;

const steps = Object.entries(stepsConfig).map(([step, config]) => ({
    ...config,
    step: parseInt(step)
}));

const SidebarSyncLayout = () => {
    const { content } = useHeaderContent();
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Get the current step based on the URL path
    const getCurrentStep = () => {
        const path = location.pathname;
        const step = steps.find(s => path.includes(s.path));
        return step?.step ?? 0;
    };

    const currentStepIndex = getCurrentStep();

    const handleStepClick = (index: number) => {
        // Only allow navigation to previous steps or the current step
        if (index <= currentStepIndex) {
            navigate(`/syncs/edit/${steps[index].path}/${id}`);
        }
    };

    return (
        <SidebarProvider defaultOpen>
            <Sidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem >
                                    <BreadcrumbLink href={"/syncs"}>Syncs</BreadcrumbLink>
                                    <BreadcrumbSeparator />
                                </BreadcrumbItem>

                                <BreadcrumbItem className='font-semibold'>
                                    <BreadcrumbPage>{id}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div>{content}</div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Stepper */}
                    <div className="w-full max-w-4xl mx-auto pt-4">
                        <Tabs value={steps[currentStepIndex].path} className="space-y-4">
                            <TabsList>
                                {steps.map((step, idx) => (
                                    <div key={step.label} className="flex items-center flex-1">
                                        <TabsTrigger
                                            value={step.path}
                                            onClick={() => handleStepClick(idx)}
                                            disabled={idx > currentStepIndex}
                                            className={cn(
                                                "flex-1 gap-2",
                                                idx > currentStepIndex && "text-muted-foreground cursor-not-allowed"
                                            )}
                                        >
                                            <Badge variant={idx === currentStepIndex ? "default" : "outline"} className="h-5 w-5 p-0 flex items-center justify-center">
                                                {idx + 1}
                                            </Badge>
                                            {step.label}
                                        </TabsTrigger>
                                        {idx < steps.length - 1 && (
                                            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
                                        )}
                                    </div>
                                ))}
                            </TabsList>
                        </Tabs>
                        {/* Step Content */}
                        <Outlet />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default SidebarSyncLayout; 