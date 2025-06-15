import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useTeamAccess = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const checkTeamAccess = async () => {
            if (!user) {
                setHasAccess(false);
                setIsLoading(false);
                return;
            }

            try {
                // Check if user has any active team memberships
                const { data: teamMembers, error: teamError } = await supabase
                    .from('view_team_members')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'active');

                if (teamError) throw teamError;

                const hasTeamAccess = teamMembers?.length > 0;
                setHasAccess(hasTeamAccess);

                // If user has no access, redirect to appropriate page
                if (!hasTeamAccess) {
                    navigate('/teams/join');
                }
            } catch (error) {
                console.error('Error checking team access:', error);
                setHasAccess(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkTeamAccess();
    }, [user, navigate]);

    return {
        isLoading,
        hasAccess
    };
}; 