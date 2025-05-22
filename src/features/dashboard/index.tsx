
import { Activity, ArrowRight, ArrowUpDown, RefreshCw } from "lucide-react";
import StatCard from "./components/StatCard";
import SyncStatusCard from "./components/SyncStatusCard";
import SyncActivityLog from "./components/SyncActivityLog";

// Mock data
const stats = [
  {
    title: "Active Syncs",
    value: 12,
    change: { value: 8, isPositive: true },
    icon: <Activity size={20} className="text-primary" />
  },
  {
    title: "Synced Entities",
    value: "5,382",
    subtitle: "Last 24 hours",
    icon: <RefreshCw size={20} className="text-primary" />
  },
  {
    title: "One-way Syncs",
    value: 8,
    icon: <ArrowRight size={20} className="text-primary" />
  },
  {
    title: "Two-way Syncs",
    value: 4,
    icon: <ArrowUpDown size={20} className="text-primary" />
  }
];

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
];

const recentLogs = [
  {
    id: "1",
    timestamp: "2 min ago",
    action: "Products Sync",
    sync: "Shopify → Airtable",
    status: "success" as const,
    message: "Successfully synced 18 products",
  },
  {
    id: "2",
    timestamp: "15 min ago",
    action: "Orders to Notion",
    sync: "Shopify → Notion",
    status: "success" as const,
    message: "Successfully synced 42 orders",
  },
  {
    id: "3",
    timestamp: "1 hr ago",
    action: "Customer Data",
    sync: "Shopify → Klaviyo",
    status: "error" as const,
    message: "API connection failed - authentication error",
  },
  {
    id: "4",
    timestamp: "3 hrs ago",
    action: "Inventory Update",
    sync: "Airtable → Shopify",
    status: "warning" as const,
    message: "5 items skipped due to validation errors",
  },
  {
    id: "5",
    timestamp: "5 hrs ago",
    action: "Products Sync",
    sync: "Shopify → Airtable",
    status: "success" as const,
    message: "Successfully synced 7 products",
  }
];

const Dashboard = () => {
  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your data syncs and syncs</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>
      
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Active Sync Syncs</h2>
          <a href="/syncs" className="text-primary text-sm hover:underline flex items-center gap-1">
            View all syncs
            <ArrowRight size={16} />
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
      
      <div>
        <SyncActivityLog logs={recentLogs} />
      </div>
    </div>
  );
};

export default Dashboard;
