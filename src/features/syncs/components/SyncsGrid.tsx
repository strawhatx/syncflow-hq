import { memo } from "react";
import SyncStatusCard from "@/features/dashboard/components/SyncStatusCard";

type Sync = {
  id: string;
  name: string;
  is_active: boolean;
  lastSync?: string;
  source?: any;
  destination?: any;
  entityCount?: number;
  setup_stage?: string;
};

const SyncsGrid = memo(({ syncs }: { syncs: Sync[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {syncs.map((sync) => {
      const status = sync.is_active && sync.setup_stage === "authorize"
        ? "active"
        : "paused";
      return (
        <SyncStatusCard
          key={sync.id}
          title={sync.name}
          status={status}
          lastSync={sync.lastSync}
          source={sync.source}
          destination={sync.destination}
          entityCount={sync.entityCount}
          syncId={sync.id}
        />
      );
    })}
  </div>
));

export default SyncsGrid; 