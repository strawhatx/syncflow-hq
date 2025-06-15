import { supabase } from '@/integrations/supabase/client';
import { teamFactory } from '@/factories/teamFactory';
import { TeamRole, TeamMemberStatus, InviteStatus } from '@/types/team';

export const teamFacade = {
    async createTeamWithOwner(userId: string, teamName: string) {
        const team = teamFactory.createTeam({ name: teamName });
        const { data: newTeam, error: teamError } = await supabase
            .from('teams')
            .insert(team)
            .select()
            .single();

        if (teamError) throw teamError;
        if (!newTeam) throw new Error('Failed to create team');

        const member = teamFactory.createTeamMember({
            team_id: newTeam.id,
            user_id: userId,
            role: 'owner'
        });

        const { error: memberError } = await supabase
            .from('team_members')
            .insert(member);

        if (memberError) {
            await supabase
                .from('teams')
                .delete()
                .eq('id', newTeam.id);
            throw memberError;
        }

        return newTeam;
    },

    async getTeamWithMembers(teamId: string) {
        const { data: team, error } = await supabase
            .from('teams')
            .select('*, team_members(*), team_invites(*)')
            .eq('id', teamId)
            .single();

        if (error) throw error;
        return team;
    },

    async updateMemberRole(memberId: string, newRole: TeamRole) {
        const { error } = await supabase
            .from('team_members')
            .update({ role: newRole })
            .eq('id', memberId);

        if (error) throw error;
    },

    async removeMember(memberId: string) {
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', memberId);

        if (error) throw error;
    },

    async inviteMember(teamId: string, email: string) {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        // Create invite record
        const { error: inviteError } = await supabase
            .from('team_invites')
            .insert({
                team_id: teamId,
                email,
                status: 'pending',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
            });

        if (inviteError) throw inviteError;

        // TODO: Send invite email
        // await supabase.functions.invoke('send-invite-email', {
        //     body: { teamId, email }
        // });
    },

    async acceptInvite(inviteId: string, userId: string) {
        // Get the invite
        const { data: invite, error: inviteError } = await supabase
            .from('team_invites')
            .select('*')
            .eq('id', inviteId)
            .single();

        if (inviteError) throw inviteError;
        if (!invite) throw new Error('Invite not found');
        if (invite.status !== 'pending') throw new Error('Invite is no longer valid');

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
    },

    async updateTeamName(teamId: string, newName: string) {
        const { error } = await supabase
            .from('teams')
            .update({ name: newName })
            .eq('id', teamId);

        if (error) throw error;
    },

    async updateMemberStatus(memberId: string, newStatus: TeamMemberStatus) {
        const { error } = await supabase
            .from('team_members')
            .update({ status: newStatus })
            .eq('id', memberId);

        if (error) throw error;
    },

    async getTeamMember(memberId: string) {
        const { data: member, error } = await supabase
            .from('team_members')
            .select('*, teams(*)')
            .eq('id', memberId)
            .single();

        if (error) throw error;
        return member;
    },

    async getTeamMembersByTeam(teamId: string) {
        const { data: members, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', teamId);

        if (error) throw error;
        return members;
    },

    async getTeamMembersByUser(userId: string) {
        const { data: members, error } = await supabase
            .from('team_members')
            .select('*, teams(*)')
            .eq('user_id', userId);

        if (error) throw error;
        return members;
    }
}; 