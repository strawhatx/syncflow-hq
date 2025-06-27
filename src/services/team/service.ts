import { supabase } from '@/integrations/supabase/client';
import { TeamRole, TeamMemberStatus, CreateTeamParams } from '@/types/team';
import { Database } from '@/integrations/supabase/types';
import { generateVerificationCode } from './code-utils';
import { sendInviteEmail } from './email-utils';
import { TeamError, withTeamErrorHandling } from './error';

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];

const createTeam = (params: CreateTeamParams): Omit<Team, 'id'> => {
    const now = new Date().toISOString();
    return {
        name: params.name,
        created_by: params.created_by,
        created_at: now,
        updated_at: now
    };
}

export const teamService = {
    createTeamWithOwner: withTeamErrorHandling(
        async (userId: string, teamName: string): Promise<Team> => {
            const team = createTeam({ name: teamName, created_by: userId });


            const { data: newTeam, error: teamError } = await supabase
                .from('teams')
                .insert(team)
                .select()
                .single();

            if (teamError) throw teamError;
            if (!newTeam) throw new TeamError('Failed to create team', 'TEAM_CREATE_FAILED');

            return newTeam;
        },
        'Failed to create team',
        'TEAM_CREATE_FAILED'
    ),

    getTeamWithMembers: withTeamErrorHandling(
        async (teamId: string) => {
            const { data: team, error } = await supabase
                .from('teams')
                .select(`
                    *,
                    view_team_members(*),
                    team_invites(*)
                `)
                .eq('id', teamId)
                .single();

            if (error) throw error;
            if (!team) throw new TeamError('Team not found', 'TEAM_NOT_FOUND');

            // Transform the data to match TeamMemberWithProfile interface
            // lets optimize this approch using map
            const members = new Map(
                team.view_team_members.map((member: any) => [member.id, {
                    ...member,
                    profile: member.profiles
                }])
            )

            return {
                ...team,
                team_members: members
            }
        },
        'Failed to fetch team',
        'TEAM_FETCH_FAILED'
    ),

    updateMemberRole: withTeamErrorHandling(
        async (memberId: string, newRole: TeamRole) => {
            const { error } = await supabase
                .from('team_members')
                .update({ role: newRole })
                .eq('id', memberId);

            if (error) throw error;
        },
        'Failed to update member role',
        'ROLE_UPDATE_FAILED'
    ),

    removeMember: withTeamErrorHandling(
        async (memberId: string) => {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;
        },
        'Failed to remove member',
        'MEMBER_REMOVE_FAILED'
    ),

    inviteMember: withTeamErrorHandling(
        async (teamId: string, email: string) => {
            // Get team name for email
            const { data: team } = await supabase
                .from('teams')
                .select('name')
                .eq('id', teamId)
                .single();

            if (!team) throw new TeamError('Team not found', 'TEAM_NOT_FOUND');

            // Check if user already exists and is already a member
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single();

            if (existingUser) {
                // Check if user is already a member
                const { data: existingMember } = await supabase
                    .from('team_members')
                    .select('id')
                    .eq('team_id', teamId)
                    .eq('user_id', existingUser.id)
                    .single();

                if (existingMember) {
                    throw new TeamError('User is already a member of this team', 'ALREADY_MEMBER');
                }
            }

            // Check for existing pending invite
            const { data: existingInvite } = await supabase
                .from('team_invites')
                .select('id')
                .eq('team_id', teamId)
                .eq('email', email)
                .eq('status', 'pending')
                .single();

            if (existingInvite) {
                throw new TeamError('An active invite already exists for this email', 'DUPLICATE_INVITE');
            }

            const verificationCode = generateVerificationCode();

            // Create invite record
            const { error: inviteError } = await supabase
                .from('team_invites')
                .insert({
                    team_id: teamId,
                    email,
                    verification_code: verificationCode,
                    status: 'pending',
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                });

            if (inviteError) throw inviteError;

            await sendInviteEmail(email, verificationCode, team.name);
        },
        'Failed to invite member',
        'INVITE_FAILED'
    ),

    updateTeamName: withTeamErrorHandling(
        async (teamId: string, newName: string) => {
            const { error } = await supabase
                .from('teams')
                .update({ name: newName })
                .eq('id', teamId);

            if (error) throw error;
        },
        'Failed to update team name',
        'NAME_UPDATE_FAILED'
    ),

    getTeamMembersByUser: withTeamErrorHandling(
        async (userId: string): Promise<{ team_members: TeamMember[], team: Team }> => {
            const { data, error } = await supabase
                .from('view_team_members')
                .select('*, teams(*)')
                .eq('user_id', userId);

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new TeamError('User is not a member of any team', 'NO_TEAM_FOUND');
            }

            // Extract team info from the first member (all members should be from the same team)
            const firstMember = data[0];
            const team = firstMember.teams;

            // Format the team members
            const team_members = data.map((member: any) => ({
                ...member,
                profile: member.profiles
            }));

            return {
                team_members,
                team
            };
        },
        'Failed to fetch user teams',
        'TEAMS_FETCH_FAILED'
    ),
}; 