import { useMemo } from 'react';
import { TeamMember } from '@/types/team';

export function useTeamStats(members: TeamMember[]) {
  return useMemo(() => ({
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    pendingInvites: members.filter(m => m.status === 'invited').length,
    admins: members.filter(m => m.role === 'admin' || m.role === 'owner').length
  }), [members]);
} 