
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SyncStatusCard from "@/features/dashboard/components/SyncStatusCard";

// Mock data for syncs
const syncSyncs = [
  {
    title: "Products Sync",
    status: "active" as const,
    lastSync: "2 min ago",
    source: { name: "Shopify", icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png" },
    destination: { name: "Airtable", icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png" },
    entityCount: 852,
    syncId: "1"
  },
  {
    title: "Orders to Notion",
    status: "synced" as const,
    lastSync: "15 min ago",
    source: { name: "Shopify", icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png" },
    destination: { name: "Notion", icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" },
    entityCount: 1243,
    syncId: "2"
  },
  {
    title: "Customer Data",
    status: "error" as const,
    lastSync: "1 hr ago",
    source: { name: "Shopify", icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png" },
    destination: { name: "Klaviyo", icon: "https://cdn.worldvectorlogo.com/logos/klaviyo-1.svg" },
    entityCount: 3287,
    syncId: "3"
  },
  {
    title: "Inventory Update",
    status: "paused" as const,
    lastSync: "3 hrs ago",
    source: { name: "Airtable", icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png" },
    destination: { name: "Shopify", icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png" },
    entityCount: 547,
    syncId: "4"
  },
];

const Syncs = () => {
  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl md:text-2xl font-semibold">Sync Syncs</h1>
          <Link to="/syncs/create">
            <Button>
              <Plus size={16} className="mr-2" />
              Create Sync
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground">Manage and monitor your data sync operations</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {syncSyncs.map((sync, index) => (
          <SyncStatusCard 
            key={index}
            title={sync.title}
            status={sync.status}
            lastSync={sync.lastSync}
            source={sync.source}
            destination={sync.destination}
            entityCount={sync.entityCount}
            syncId={sync.syncId}
          />
        ))}
      </div>
    </div>
  );
};

export default Syncs;
