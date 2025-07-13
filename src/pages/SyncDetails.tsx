
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Pause, Play, Trash2, Settings, Clock, AlertTriangle, Check, Database } from "lucide-react";
import { PagePermissionGuard } from "../hocs/withPagePermission";
import { useQuery } from "@tanstack/react-query";
import { fetchSyncById } from "@/services/syncs/service";

const SyncDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch sync data
  const { data: sync, isLoading, error } = useQuery({
    queryKey: ["sync", id],
    queryFn: () => fetchSyncById(id!),
    enabled: !!id,
  });

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading sync details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !sync) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Sync not found</h1>
          <p className="text-muted-foreground mb-6">
            The sync you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link 
            to="/syncs" 
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Syncs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PagePermissionGuard 
      resource="syncs" 
      action="view" 
      data={sync} // Pass the sync data for permission checking
      isLoading={isLoading}
    >
      <div>
        <div className="mb-6">
          <div className="breadcrumb">
            <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/syncs" className="hover:text-foreground">Syncs</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="text-foreground">{sync.name}</span>
          </div>
        </div>
        
        {/* Rest of the component remains the same but uses sync data instead of syncData */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl border border-border p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold">{sync.name}</h1>
                  <p className="text-muted-foreground">{sync.description || "No description"}</p>
                </div>
                {getStatusBadge(sync.is_active ? "active" : "paused")}
              </div>
              
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                  <Database size={24} className="text-muted-foreground" />
                </div>
                
                <div className="mx-4 text-muted-foreground">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                  <Database size={24} className="text-muted-foreground" />
                </div>
                
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">
                    Sync ID: {sync.id}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Status:</span> {sync.is_active ? "Active" : "Paused"}
                    <span className="mx-2">•</span>
                    <span className="text-muted-foreground">Created:</span> {new Date(sync.created_at).toLocaleDateString()}
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
            
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-medium mb-4">Sync Configuration</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sync ID</p>
                  <p className="font-mono text-sm">{sync.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(sync.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{new Date(sync.updated_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-sm">{sync.is_active ? "Active" : "Paused"}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-medium mb-4">Sync Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Team ID</p>
                  <p className="font-mono text-sm">{sync.team_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Setup Stage</p>
                  <p className="text-sm capitalize">{sync.setup_stage || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PagePermissionGuard>
  );
};

export default SyncDetails;
