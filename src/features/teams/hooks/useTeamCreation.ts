import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useTeamCreation = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const createTeam = async () => {
        if (!user) return;
        
        setIsLoading(true);
        try {
            // Create the team
            const { data: teams, error: teamError } = await supabase
                .from('teams')
                .insert([{ name: `${user.email}'s Team` }])
                .select();

            if (teamError) throw teamError;
            if (!teams || teams.length === 0) throw new Error('Failed to create team');

            const team = teams[0];

            // Add user as owner
            const { error: memberError } = await supabase
                .from('team_members')
                .insert([{
                    team_id: team.id,
                    user_id: user.id,
                    role: 'owner',
                    status: 'active'
                }]);

            if (memberError) throw memberError;

            toast({
                title: "Success",
                description: "Team created successfully",
            });

            navigate('/teams');
            return team;
        } catch (error) {
            console.error('Error creating team:', error);
            toast({
                title: "Error",
                description: "Failed to create team",
                variant: "destructive",
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createTeam,
        isLoading
    };
}; 