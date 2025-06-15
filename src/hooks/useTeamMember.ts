import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMemberData {
  id: string;
  team_id: string;
  user_id: string;
  roles: ('owner' | 'admin' | 'member')[];
  status: 'active' | 'invited';
}

export function useTeamMember() {
  const { user } = useAuth();
  const [teamMember, setTeamMember] = useState<TeamMemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTeamMember() {
      if (!user) {
        setTeamMember(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('view_team_members')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setTeamMember(null);
          setIsLoading(false);
          return;
        }

        setTeamMember({ ...data, roles: [data.role] });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch team member data'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamMember();
  }, [user]);

  return { teamMember, isLoading, error };
} 