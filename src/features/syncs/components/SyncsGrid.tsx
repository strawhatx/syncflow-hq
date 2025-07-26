import SyncStatusCard from "@/components/syncs/SyncStatusCard";
import { SyncStage, SyncStatus } from "@/types/sync";

type Sync = {
  id: string;
  name: string;
  lastSync?: string;
  source?: any;
  destination?: any;
  entityCount?: number;
  stage?: SyncStage;
  status?: SyncStatus;
};

const SyncsGrid = ({ syncs }: { syncs: Sync[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {syncs.map((sync) => {
      const status = sync.status || "draft";
      return (
        <SyncStatusCard
          key={sync.id}
          title={sync.name}
          is_completed={sync.status === "active"}
          lastSync={sync.lastSync}
          source={sync.source}
          destination={sync.destination}
          entityCount={sync.entityCount}
          syncId={sync.id}
          stage={sync.stage}
          status={sync.status}
        />
      );
    })}
  </div>
);

export default SyncsGrid; 