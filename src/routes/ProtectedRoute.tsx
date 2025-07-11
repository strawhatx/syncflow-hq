
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { hasPermission } from '@/lib/permissions';
import { useTeamMember } from '@/hooks/useTeamMember';

interface ProtectedRouteProps {
  children: React.ReactNode;
  resource: keyof Permissions;
  action: keyof Permissions[keyof Permissions];
}

const ProtectedRoute = ({ children, resource, action }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const { teamMember } = useTeamMember();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the location they tried to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if the user has the required permissions
  const hasAccess = hasPermission({ ...teamMember, role: teamMember?.role }, resource, action);

  if (!hasAccess) {
    // Redirect to the dashboard if the user lacks permissions
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
