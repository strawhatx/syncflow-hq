import { ComponentType, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { hasPermission, type Permissions } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

interface WithPagePermissionProps {
  children: ReactNode;
  resource: keyof Permissions;
  action: Permissions[keyof Permissions]["action"];
  data?: any; // The data needed for permission checking
  isLoading?: boolean; // Whether the data is still loading
  fallback?: ReactNode; // Custom fallback component
  redirectTo?: string; // Where to redirect if no permission
}

export const withPagePermission = <P extends object>(
  WrappedComponent: ComponentType<P>,
  resource: keyof Permissions,
  action: Permissions[keyof Permissions]["action"],
  options: {
    getData?: (props: P) => any;
    isLoading?: (props: P) => boolean;
    fallback?: ReactNode;
    redirectTo?: string;
  } = {}
) => {
  return function WithPagePermissionComponent(props: P) {
    const { user } = useAuth();
    const { currentMember } = useTeam();
    
    const data = options.getData ? options.getData(props) : undefined;
    const isLoading = options.isLoading ? options.isLoading(props) : false;

    // Show loading state while data is being fetched
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

    // Check if user is authenticated
    if (!user) {
      return <Navigate to="/auth" replace />;
    }

    // Check permissions with the loaded data
    const hasAccess = hasPermission(
      { id: user.id, team_member: currentMember },
      resource,
      action,
      data
    );

    if (!hasAccess) {
      if (options.fallback) {
        return <>{options.fallback}</>;
      }
      
      return <Navigate to={options.redirectTo || "/dashboard"} replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

// Standalone component for page-level permission checking
export const PagePermissionGuard: React.FC<WithPagePermissionProps> = ({
  children,
  resource,
  action,
  data,
  isLoading = false,
  fallback,
  redirectTo = "/dashboard"
}) => {
  const { user } = useAuth();
  const { currentMember } = useTeam();

  // Show loading state while data is being fetched
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

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check permissions with the loaded data
  const hasAccess = hasPermission(
    { id: user.id, team_member: currentMember },
    resource,
    action,
    data
  );

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}; 