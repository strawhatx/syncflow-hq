import { useState, useEffect } from "react";
import { useHeaderContent } from "@/contexts/HeaderContentContext";
import HeaderActions from "./components/HeaderActions";
import SyncsGrid from "./components/SyncsGrid";
import NoResults from "./components/NoResults";
import SyncsSkeleton from "./components/SyncsSkeleton";
import useSyncs from "./hooks/useSyncs";
import { useToast } from "@/hooks/use-toast";
import { PagePermissionGuard } from "@/hocs/withPagePermission";

const Syncs = () => {
    const [search, setSearch] = useState("");
    const { isLoading, createSyncMutation, filteredSyncs } = useSyncs(search);
    const { setContent } = useHeaderContent();
    const { toast } = useToast();

    const headerContent = (
        <HeaderActions
            search={search}
            setSearch={setSearch}
            onCreate={() => createSyncMutation.mutate()}
            isCreating={createSyncMutation.isPending}
        />
    );

    // Effect for setting content
    useEffect(() => {
        setContent(headerContent);
    }, [search, createSyncMutation.isPending, setContent, headerContent]);

    // Effect for showing error toast
    useEffect(() => {
        if (createSyncMutation.isError) {
            toast({
                title: "Error",
                description: "Failed to create sync. Please try again.",
                variant: "destructive",
            });
        }
    }, [createSyncMutation.isError, toast]);

    // Separate effect for cleanup
    useEffect(() => {
        return () => {setContent(null)};
    }, [setContent]);

    const MainContent = () => (
        <div>
            {isLoading ? (
                <SyncsSkeleton />
            ) : filteredSyncs.length === 0 ? (
                <NoResults onGetStarted={() => createSyncMutation.mutate()} />
            ) : (
                <SyncsGrid syncs={filteredSyncs} />
            )}
        </div>
    )

    return (
        <PagePermissionGuard
            resource="syncs"
            action="view"
            isLoading={isLoading} // Show loading while team data is being fetched
        >
            <MainContent />
        </PagePermissionGuard>
    );
};

export default Syncs;
