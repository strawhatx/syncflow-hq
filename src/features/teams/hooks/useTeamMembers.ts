import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types/team';
import { useAuth } from '@/contexts/AuthContext';

export function useTeamMembers() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        async function fetchMembers() {
            if (!user) return;

            try {
                // First get the user's team_id
                const { data: userTeam, error: teamError } = await supabase
                    .from('view_team_members')
                    .select('team_id')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .maybeSingle();

                if (teamError) throw teamError;

                // If user has no team, return empty array
                if (!userTeam) {
                    setTeamMembers([]);
                    setIsLoading(false);
                    return;
                }

                // Then get all members of that team
                const { data: members, error: membersError } = await supabase
                    .from('view_team_members')
                    .select('*')
                    .eq('team_id', userTeam.team_id)
                    .order('created_at', { ascending: true });

                if (membersError) throw membersError;
                setTeamMembers(members || []);
            } catch (error) {
                console.error('Error fetching team members:', error);
                setTeamMembers([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMembers();
    }, [user]);

    return { teamMembers, isLoading };
} 