import { TeamMember, Team, CreateTeamMemberParams, CreateTeamParams } from '@/types/team';

export const teamFactory = {
    createTeamMember(params: CreateTeamMemberParams): Omit<TeamMember, 'id'> {
        const now = new Date().toISOString();
        const role = params.role || 'member';
        return {
            team_id: params.team_id,
            user_id: params.user_id,
            role,
            status: params.status || 'active',
            created_at: now,
            updated_at: now
        };
    },

    createTeam(params: CreateTeamParams): Omit<Team, 'id'> {
        const now = new Date().toISOString();
        return {
            name: params.name,
            created_by: params.created_by,
            created_at: now,
            updated_at: now
        };
    }
}; 