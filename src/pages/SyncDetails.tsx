
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Pause, Play, Trash2, Settings, Clock, AlertTriangle, Check } from "lucide-react";

// Mock data for the sync details
const syncData = {
  id: "1",
  name: "Products Sync",
  description: "Syncs products from Shopify to Airtable",
  status: "active",
  lastSynced: "10 minutes ago",
  source: {
    name: "Shopify",
    icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png"
  },
  destination: {
    name: "Airtable",
    icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png"
  },
  direction: "one-way",
  entityType: "products",
  entityCount: 852,
  fieldMappings: [
    { sourceField: "id", sourceType: "string", destinationField: "ID", destinationType: "string" },
    { sourceField: "title", sourceType: "string", destinationField: "Name", destinationType: "string" },
    { sourceField: "description", sourceType: "text", destinationField: "Description", destinationType: "text" },
    { sourceField: "price", sourceType: "number", destinationField: "Price", destinationType: "number" },
    { sourceField: "inventory_quantity", sourceType: "number", destinationField: "Stock", destinationType: "number" },
    { sourceField: "tags", sourceType: "array", destinationField: "Tags", destinationType: "multiple select" },
    { sourceField: "images", sourceType: "array", destinationField: "Images", destinationType: "attachments" },
    { sourceField: "created_at", sourceType: "datetime", destinationField: "Creation Date", destinationType: "date" },
  ],
  conflicts: [
    { 
      id: "c1", 
      entityId: "prod_123", 
      entityName: "Blue T-Shirt", 
      field: "price", 
      sourceValue: "$24.99", 
      destinationValue: "$19.99", 
      timestamp: "2 hours ago" 
    },
    { 
      id: "c2", 
      entityId: "prod_456", 
      entityName: "Red Hoodie", 
      field: "inventory_quantity", 
      sourceValue: "15", 
      destinationValue: "12", 
      timestamp: "3 hours ago" 
    }
  ],
  recentSyncs: [
    { id: "s1", status: "success", timestamp: "10 minutes ago", entitiesUpdated: 5 },
    { id: "s2", status: "warning", timestamp: "1 hour ago", entitiesUpdated: 12, warnings: 2 },
    { id: "s3", status: "success", timestamp: "3 hours ago", entitiesUpdated: 7 },
    { id: "s4", status: "error", timestamp: "1 day ago", entitiesUpdated: 0, error: "API rate limit exceeded" },
  ]
};

const SyncDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="badge badge-success">Active</span>;
      case "paused":
        return <span className="badge badge-warning">Paused</span>;
      case "error":
        return <span className="badge badge-error">Error</span>;
      default:
        return null;
    }
  };
  
  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check size={16} className="text-green-500" />;
      case "error":
        return <AlertTriangle size={16} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-500" />;
      default:
        return <Clock size={16} className="text-blue-500" />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="breadcrumb">
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/syncs" className="hover:text-foreground">Syncs</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="text-foreground">{syncData.name}</span>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl border border-border p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">{syncData.name}</h1>
                <p className="text-muted-foreground">{syncData.description}</p>
              </div>
              {getStatusBadge(syncData.status)}
            </div>
            
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                <img src={syncData.source.icon} alt={syncData.source.name} className="h-8 w-8" />
              </div>
              
              <div className="mx-4 text-muted-foreground">
                {syncData.direction === "one-way" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 8L21 12M21 12L17 16M21 12H3M7 16L3 12M3 12L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              
              <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                <img src={syncData.destination.icon} alt={syncData.destination.name} className="h-8 w-8" />
              </div>
              
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  {syncData.direction === "one-way" 
                    ? `One-way: ${syncData.source.name} → ${syncData.destination.name}`
                    : `Two-way: ${syncData.source.name} ↔ ${syncData.destination.name}`
                  }
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Entity:</span> {syncData.entityType}
                  <span className="mx-2">•</span>
                  <span className="text-muted-foreground">Count:</span> {syncData.entityCount}
                  <span className="mx-2">•</span>
                  <span className="text-muted-foreground">Last synced:</span> {syncData.lastSynced}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                <RefreshCw size={16} />
                <span>Sync Now</span>
              </button>
              
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                <Pause size={16} />
                <span>Pause</span>
              </button>
              
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                <Settings size={16} />
                <span>Settings</span>
              </button>
              
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors ml-auto">
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-medium">Field Mapping</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-secondary/50">
                  <tr>
                    <th scope="col" className="table-header">{syncData.source.name} Field</th>
                    <th scope="col" className="table-header">{syncData.source.name} Type</th>
                    <th scope="col" className="table-header"></th>
                    <th scope="col" className="table-header">{syncData.destination.name} Field</th>
                    <th scope="col" className="table-header">{syncData.destination.name} Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {syncData.fieldMappings.map((mapping, index) => (
                    <tr key={index} className="hover:bg-secondary/30 transition-colors">
                      <td className="table-cell font-medium">{mapping.sourceField}</td>
                      <td className="table-cell text-muted-foreground">{mapping.sourceType}</td>
                      <td className="table-cell text-center">→</td>
                      <td className="table-cell font-medium">{mapping.destinationField}</td>
                      <td className="table-cell text-muted-foreground">{mapping.destinationType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-medium">Recent Syncs</h3>
            </div>
            
            <div className="divide-y divide-border">
              {syncData.recentSyncs.map((sync) => (
                <div key={sync.id} className="px-6 py-3 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      {getSyncStatusIcon(sync.status)}
                      <span className={`ml-2 text-sm font-medium ${
                        sync.status === "success" ? "text-green-600" :
                        sync.status === "error" ? "text-red-600" :
                        "text-amber-600"
                      }`}>
                        {sync.status === "success" ? "Successful" :
                         sync.status === "error" ? "Failed" :
                         "Completed with warnings"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{sync.timestamp}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {sync.status === "success" 
                      ? `Updated ${sync.entitiesUpdated} entities` 
                      : sync.status === "error" 
                      ? sync.error 
                      : `Updated ${sync.entitiesUpdated} entities (${sync.warnings} warnings)`}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-3 border-t border-border text-center">
              <a href="#" className="text-primary text-sm hover:underline">View full history</a>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-medium">Conflicts</h3>
              <span className="badge badge-error">{syncData.conflicts.length}</span>
            </div>
            
            <div className="divide-y divide-border">
              {syncData.conflicts.map((conflict) => (
                <div key={conflict.id} className="px-6 py-3 hover:bg-secondary/30 transition-colors">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{conflict.entityName}</span>
                    <span className="text-xs text-muted-foreground">{conflict.timestamp}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    Field: <span className="font-medium text-foreground">{conflict.field}</span>
                  </p>
                  
                  <div className="flex text-sm">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Shopify</p>
                      <p>{conflict.sourceValue}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Airtable</p>
                      <p>{conflict.destinationValue}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex gap-2">
                    <button className="flex-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      Use Shopify
                    </button>
                    <button className="flex-1 text-xs px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                      Use Airtable
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-3 border-t border-border text-center">
              <a href="#" className="text-primary text-sm hover:underline">Resolve all conflicts</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncDetails;
