
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useSync } from "@/contexts/SyncContext";

const ProtectedSyncViewRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { id } = useParams();
  const { syncConfig } = useSync();
  const location = useLocation(); 
  
  // if no id, redirect to syncs cuz it will never load
  if (!id) {
    return <Navigate to="/syncs" state={{ from: location }} replace />;
  }

  if (isLoading || !syncConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // if no user, redirect to login
  if (!user) {
    // Redirect to login but save the location they tried to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // if the sync is not draft, redirect to the view page
  if (syncConfig.status !== "draft") {
    return <Navigate to={`/syncs/view/${id}`} state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedSyncViewRoute;
