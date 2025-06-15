import { ComponentType } from 'react';
import { useTeamMember } from '@/hooks/useTeamMember';
import { hasPermission, type Permissions } from '@/lib/permissions';

export const withPermission = <P extends object>(
  WrappedComponent: ComponentType<P>,
  resource: keyof Permissions,
  action: Permissions[keyof Permissions]["action"]
) => {
  return function WithPermissionComponent(props: P) {
    const { teamMember } = useTeamMember();
    const hasAccess = hasPermission(teamMember, resource, action);

    if (!hasAccess) return null;
    return <WrappedComponent {...props} />;
  };
}; 