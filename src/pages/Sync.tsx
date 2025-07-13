import { useTeam } from "@/contexts/TeamContext";
import Sync from "@/features/sync";
import { PagePermissionGuard } from "@/hocs/withPagePermission";

const SyncPage = () => {
    const { team } = useTeam();
    return (
        <PagePermissionGuard 
        resource="syncs" 
        action="view" 
        data={team} // Pass the team data for permission checking
        isLoading={!team} // Show loading while team data is being fetched
      >
        <Sync />
      </PagePermissionGuard>
    );
};

export default SyncPage;
