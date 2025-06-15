import { TeamMember, Team, CreateTeamMemberParams, CreateTeamParams } from '@/types/team';

export const teamFactory = {
    createTeamMember(params: CreateTeamMemberParams): TeamMember {
        const now = new Date().toISOString();
        const role = params.role || 'member';
        return {
            id: null,
            team_id: params.team_id,
            user_id: params.user_id,
            role,
            status: params.status || 'active',
            created_at: now,
            updated_at: now
        };
    },

    createTeam(params: CreateTeamParams): Team {
        const now = new Date().toISOString();
        return {
            id: null,
            name: params.name,
            created_at: now,
            updated_at: now
        };
    }
}; 