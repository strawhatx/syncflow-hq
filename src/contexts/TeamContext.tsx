import React, { createContext, useContext, useState, useCallback } from 'react';
    import { TeamMember, Team, TeamRole, TeamMemberStatus } from '@/types/team';
import { teamFacade } from '@/facades/teamFacade';
import { createPermissionStrategy } from '@/strategies/team';
import { useAuth } from './AuthContext';

interface TeamContextType {
    team: Team | null;
    members: TeamMember[];
    loading: boolean;
    error: Error | null;
    currentMember: TeamMember | null;
    permissionStrategy: ReturnType<typeof createPermissionStrategy>;
    loadTeam: (teamId: string) => Promise<void>;
    loadCurrentUserTeam: () => Promise<void>;
    createTeamWithOwner: (userId: string, teamName: string) => Promise<Team>;
    updateMemberRole: (memberId: string, newRole: TeamRole) => Promise<void>;
    removeMember: (memberId: string) => Promise<void>;
    inviteMember: (email: string) => Promise<void>;
    canInviteMembers: () => boolean;
    canUpdateRole: (targetMember: TeamMember) => boolean;
    canRemoveMember: (targetMember: TeamMember) => boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
    const permissionStrategy = createPermissionStrategy('role-based');
    const { user } = useAuth();

    const loadTeam = useCallback(async (teamId: string) => {
        try {
            setLoading(true);
            // Get team with members
            const teamData = await teamFacade.getTeamWithMembers(teamId);
            setTeam(teamData);
            
            // Convert Map to array and cast types
            const membersArray = Array.from(teamData.team_members.values()).map((member: any) => ({
                ...member,
                role: member.role as TeamRole,
                status: member.status as TeamMemberStatus
            }));
            setMembers(membersArray);
            
            // Set current member based on user ID
            const currentUserMember = membersArray.find(
                (m: TeamMember) => m.user_id === user?.id
            );
            setCurrentMember(currentUserMember || null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load team'));
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const loadCurrentUserTeam = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            setLoading(true);
            const userTeamData = await teamFacade.getTeamMembersByUser(user.id);
            setTeam(userTeamData.team);
            
            // Cast the members to proper types
            const formattedMembers = userTeamData.team_members.map((member: any) => ({
                ...member,
                role: member.role as TeamRole,
                status: member.status as TeamMemberStatus
            }));
            setMembers(formattedMembers);
            
            // Set current member (should be the first one since we're getting by user ID)
            setCurrentMember(formattedMembers[0] || null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load current user team'));
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const createTeamWithOwner = useCallback(async (userId: string, teamName: string) => {
        try {
            setLoading(true);
            const newTeam = await teamFacade.createTeamWithOwner(userId, teamName);
            setTeam(newTeam);
            // Load the team to get the members
            await loadTeam(newTeam.id);
            return newTeam;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create team'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadTeam]);

    const updateMemberRole = useCallback(async (memberId: string, newRole: TeamRole) => {
        try {
            await teamFacade.updateMemberRole(memberId, newRole);
            setMembers(prev => prev.map(m => 
                m.id === memberId ? { ...m, role: newRole } : m
            ));
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update role'));
        }
    }, []);

    const removeMember = useCallback(async (memberId: string) => {
        try {
            await teamFacade.removeMember(memberId);
            setMembers(prev => prev.filter(m => m.id !== memberId));
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to remove member'));
        }
    }, []);

    const inviteMember = useCallback(async (email: string) => {
        if (!team) throw new Error('No team selected');
        try {
            await teamFacade.inviteMember(team.id, email);
            // Refresh team members after invite
            await loadTeam(team.id);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to invite member'));
        }
    }, [team, loadTeam]);

    const canInviteMembers = useCallback(() => {
        return currentMember ? permissionStrategy.canInviteMembers(currentMember) : false;
    }, [currentMember, permissionStrategy]);

    const canUpdateRole = useCallback((targetMember: TeamMember) => {
        return currentMember ? permissionStrategy.canUpdateRole(currentMember, targetMember) : false;
    }, [currentMember, permissionStrategy]);

    const canRemoveMember = useCallback((targetMember: TeamMember) => {
        return currentMember ? permissionStrategy.canRemoveMember(currentMember, targetMember) : false;
    }, [currentMember, permissionStrategy]);

    const value = {
        team,
        members,
        loading,
        error,
        currentMember,
        permissionStrategy,
        loadTeam,
        loadCurrentUserTeam,
        createTeamWithOwner,
        updateMemberRole,
        removeMember,
        inviteMember,
        canInviteMembers,
        canUpdateRole,
        canRemoveMember
    };

    return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
}; 