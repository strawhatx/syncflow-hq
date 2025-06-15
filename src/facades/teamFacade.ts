import { supabase } from '@/integrations/supabase/client';
import { teamFactory } from '@/factories/teamFactory';
import { TeamRole, TeamMemberStatus, InviteStatus } from '@/types/team';
import { Database } from '@/integrations/supabase/types';

type TeamInvite = Database['public']['Tables']['team_invites']['Row'];
type TeamMember = Database['public']['Tables']['team_members']['Row'];
type Team = Database['public']['Tables']['teams']['Row'];

class TeamError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'TeamError';
    }
}

function generateVerificationCode(): string {
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 12);

}

async function sendInviteEmail(email: string, verificationCode: string, teamName: string) {
    try {
        await supabase.functions.invoke('send-email', {
            body: {
                subject: `Invitation to join ${teamName}`,
                email,
                message: `You have been invited to join ${teamName}. Please use the following verification code to join: ${verificationCode}`
            }
        });
    } catch (error) {
        console.error('Failed to send invite email:', error);
        throw new TeamError('Failed to send invite email', 'EMAIL_SEND_FAILED');
    }
}

export const teamFacade = {
    async createTeamWithOwner(userId: string, teamName: string): Promise<Team> {
        const team = teamFactory.createTeam({ name: teamName });
        
        try {
            const { data: newTeam, error: teamError } = await supabase
                .from('teams')
                .insert(team)
                .select()
                .single();

            if (teamError) throw teamError;
            if (!newTeam) throw new TeamError('Failed to create team', 'TEAM_CREATE_FAILED');

            const member = teamFactory.createTeamMember({
                team_id: newTeam.id,
                user_id: userId,
                role: 'owner'
            });

            const { error: memberError } = await supabase
                .from('team_members')
                .insert(member);

            if (memberError) {
                // Rollback team creation if member creation fails
                await supabase
                    .from('teams')
                    .delete()
                    .eq('id', newTeam.id);
                throw memberError;
            }

            return newTeam;
        } catch (error) {
            if (error instanceof TeamError) throw error;
            throw new TeamError('Failed to create team', 'TEAM_CREATE_FAILED');
        }
    },

    async getTeamWithMembers(teamId: string) {
        try {
            const { data: team, error } = await supabase
                .from('teams')
                .select(`
                    *,
                    view_team_members!inner(
                        *,
                        profiles:user_id(
                            full_name,
                            avatar_url,
                            email
                        )
                    ),
                    team_invites(*)
                `)
                .eq('id', teamId)
                .single();

            if (error) throw error;
            if (!team) throw new TeamError('Team not found', 'TEAM_NOT_FOUND');

            // Transform the data to match TeamMemberWithProfile interface
            const transformedTeam = {
                ...team,
                team_members: team.view_team_members.map((member: any) => ({
                    ...member,
                    profile: member.profiles
                }))
            };

            return transformedTeam;
        } catch (error) {
            if (error instanceof TeamError) throw error;
            throw new TeamError('Failed to fetch team', 'TEAM_FETCH_FAILED');
        }
    },

    async updateMemberRole(memberId: string, newRole: TeamRole) {
        try {
            const { error } = await supabase
                .from('team_members')
                .update({ role: newRole })
                .eq('id', memberId);

            if (error) throw error;
        } catch (error) {
            throw new TeamError('Failed to update member role', 'ROLE_UPDATE_FAILED');
        }
    },

    async removeMember(memberId: string) {
        try {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;
        } catch (error) {
            throw new TeamError('Failed to remove member', 'MEMBER_REMOVE_FAILED');
        }
    },

    async inviteMember(teamId: string, email: string) {
        try {
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
        } catch (error) {
            if (error instanceof TeamError) throw error;
            throw new TeamError('Failed to invite member', 'INVITE_FAILED');
        }
    },

    async verifyInvite(inviteId: string, code: string): Promise<TeamInvite> {
        try {
            const { data: invite, error: inviteError } = await supabase
                .from('team_invites')
                .select('*')
                .eq('id', inviteId)
                .single();

            if (inviteError) throw inviteError;
            if (!invite) throw new TeamError('Invite not found', 'INVITE_NOT_FOUND');
            if (invite.status !== 'pending') throw new TeamError('Invite is no longer valid', 'INVITE_EXPIRED');
            if (invite.verification_code !== code.toUpperCase()) throw new TeamError('Invalid verification code', 'INVALID_CODE');

            return invite;
        } catch (error) {
            if (error instanceof TeamError) throw error;
            throw new TeamError('Failed to verify invite', 'VERIFY_FAILED');
        }
    },

    async acceptInvite(inviteId: string, userId: string) {
        try {
            // Get the invite
            const { data: invite, error: inviteError } = await supabase
                .from('team_invites')
                .select('*')
                .eq('id', inviteId)
                .single();

            if (inviteError) throw inviteError;
            if (!invite) throw new TeamError('Invite not found', 'INVITE_NOT_FOUND');
            if (invite.status !== 'pending') throw new TeamError('Invite is no longer valid', 'INVITE_EXPIRED');

            // Create team member with default 'member' role
            const { error: memberError } = await supabase
                .from('team_members')
                .insert({
                    team_id: invite.team_id,
                    user_id: userId,
                    role: 'member',
                    status: 'active'
                });

            if (memberError) throw memberError;

            // Update invite status
            const { error: updateError } = await supabase
                .from('team_invites')
                .update({ status: 'accepted' })
                .eq('id', inviteId);

            if (updateError) throw updateError;
        } catch (error) {
            if (error instanceof TeamError) throw error;
            throw new TeamError('Failed to accept invite', 'ACCEPT_FAILED');
        }
    },

    async updateTeamName(teamId: string, newName: string) {
        try {
            const { error } = await supabase
                .from('teams')
                .update({ name: newName })
                .eq('id', teamId);

            if (error) throw error;
        } catch (error) {
            throw new TeamError('Failed to update team name', 'NAME_UPDATE_FAILED');
        }
    },

    async updateMemberStatus(memberId: string, newStatus: TeamMemberStatus) {
        try {
            const { error } = await supabase
                .from('team_members')
                .update({ status: newStatus })
                .eq('id', memberId);

            if (error) throw error;
        } catch (error) {
            throw new TeamError('Failed to update member status', 'STATUS_UPDATE_FAILED');
        }
    },

    async getTeamMember(memberId: string): Promise<TeamMember> {
        try {
            const { data: member, error } = await supabase
                .from('team_members')
                .select('*, teams(*)')
                .eq('id', memberId)
                .single();

            if (error) throw error;
            if (!member) throw new TeamError('Member not found', 'MEMBER_NOT_FOUND');
            return member;
        } catch (error) {
            if (error instanceof TeamError) throw error;
            throw new TeamError('Failed to fetch team member', 'MEMBER_FETCH_FAILED');
        }
    },

    async getTeamMembersByTeam(teamId: string): Promise<TeamMember[]> {
        try {
            const { data: members, error } = await supabase
                .from('view_team_members')
                .select('*')
                .eq('team_id', teamId);

            if (error) throw error;
            return members || [];
        } catch (error) {
            throw new TeamError('Failed to fetch team members', 'MEMBERS_FETCH_FAILED');
        }
    },

    async getTeamMembersByUser(userId: string): Promise<TeamMember[]> {
        try {
            const { data: members, error } = await supabase
                .from('team_members')
                .select('*, teams(*)')
                .eq('user_id', userId);

            if (error) throw error;
            return members || [];
        } catch (error) {
            throw new TeamError('Failed to fetch user teams', 'TEAMS_FETCH_FAILED');
        }
    }
}; 