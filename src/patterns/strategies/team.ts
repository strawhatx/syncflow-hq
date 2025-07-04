import { TeamMember } from '@/types/team';
import { hasPermission } from '@/lib/permissions';

interface TeamPermissionStrategy {
    canInviteMembers(user: TeamMember): boolean;
    canUpdateRole(user: TeamMember, targetMember: TeamMember): boolean;
    canRemoveMember(user: TeamMember, targetMember: TeamMember): boolean;
}

export class RoleBasedPermissionStrategy implements TeamPermissionStrategy {
    canInviteMembers(user: TeamMember): boolean {
        return hasPermission(user, "teams", "invite_member");
    }

    canUpdateRole(user: TeamMember, targetMember: TeamMember): boolean {
        return hasPermission(user, "team_members", "update_role", targetMember);
    }

    canRemoveMember(user: TeamMember, targetMember: TeamMember): boolean {
        return hasPermission(user, "team_members", "remove", targetMember);
    }
}

export class StrictPermissionStrategy implements TeamPermissionStrategy {
    canInviteMembers(user: TeamMember): boolean {
        return user.role === 'owner';
    }

    canUpdateRole(user: TeamMember, targetMember: TeamMember): boolean {
        return user.role === 'owner' && targetMember.role !== 'owner';
    }

    canRemoveMember(user: TeamMember, targetMember: TeamMember): boolean {
        return user.role === 'owner' && targetMember.role !== 'owner';
    }
}

// Factory for creating permission strategies
export const createPermissionStrategy = (type: 'role-based' | 'strict'): PermissionStrategy => {
    switch (type) {
        case 'strict':
            return new StrictPermissionStrategy();
        case 'role-based':
        default:
            return new RoleBasedPermissionStrategy();
    }
}; 