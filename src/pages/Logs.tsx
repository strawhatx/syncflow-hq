
import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import LogsTable from "../components/logs/LogsTable";

// Mock data for logs
const allLogs = [
  {
    id: "1",
    timestamp: "2 min ago",
    flow: "Products Sync",
    action: "Entity Updated",
    status: "success" as const,
    message: "Updated product 'Blue T-Shirt'",
  },
  {
    id: "2",
    timestamp: "15 min ago",
    flow: "Orders to Notion",
    action: "Entity Created",
    status: "success" as const,
    message: "Created order #1234",
  },
  {
    id: "3",
    timestamp: "1 hr ago",
    flow: "Customer Data",
    action: "Sync Failed",
    status: "error" as const,
    message: "API connection error - authentication failed",
  },
  {
    id: "4",
    timestamp: "3 hrs ago",
    flow: "Inventory Update",
    action: "Entity Skipped",
    status: "warning" as const,
    message: "Skipped product 'Red Hoodie' - validation failed",
  },
  {
    id: "5",
    timestamp: "5 hrs ago",
    flow: "Products Sync",
    action: "Entity Updated",
    status: "success" as const,
    message: "Updated product 'Black Jeans'",
  },
  {
    id: "6",
    timestamp: "6 hrs ago",
    flow: "Orders to Notion",
    action: "Sync Completed",
    status: "success" as const,
    message: "Sync completed successfully - 42 entities processed",
  },
  {
    id: "7",
    timestamp: "1 day ago",
    flow: "Customer Data",
    action: "Sync Started",
    status: "pending" as const,
    message: "Starting scheduled sync",
  },
  {
    id: "8",
    timestamp: "1 day ago",
    flow: "Customer Data",
    action: "Rate Limited",
    status: "warning" as const,
    message: "API rate limit reached - pausing sync",
  },
  {
    id: "9",
    timestamp: "2 days ago",
    flow: "Products Sync",
    action: "Conflict Detected",
    status: "warning" as const,
    message: "Conflict detected for product 'Green Sweater'",
  },
  {
    id: "10",
    timestamp: "2 days ago",
    flow: "Orders to Notion",
    action: "Sync Completed",
    status: "success" as const,
    message: "Sync completed successfully - 37 entities processed",
  },
];

const Logs = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  const tabs = [
    { id: "all", name: "All" },
    { id: "success", name: "Success" },
    { id: "warning", name: "Warnings" },
    { id: "error", name: "Errors" },
    { id: "pending", name: "Pending" },
  ];
  
  const filteredLogs = activeTab === "all" 
    ? allLogs 
    : allLogs.filter(log => log.status === activeTab);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Sync Logs</h1>
        <p className="text-muted-foreground">Track and troubleshoot your sync operations</p>
      </div>
      
      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-secondary/50 transition-colors">
            <Filter size={14} />
            <span>Filter</span>
            <ChevronDown size={14} />
          </button>
          
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-secondary/50 transition-colors">
            <span>Last 7 days</span>
            <ChevronDown size={14} />
          </button>
          
          <button className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
            Export
          </button>
        </div>
      </div>
      
      <LogsTable logs={filteredLogs} />
    </div>
  );
};

export default Logs;
