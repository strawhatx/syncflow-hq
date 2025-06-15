import { createContext, useContext, ReactNode } from 'react';
import { TeamMember } from '@/types/team';

interface TeamMemberContextType {
  teamMember: TeamMember | null;
}

const TeamMemberContext = createContext<TeamMemberContextType | null>(null);

export const TeamMemberProvider = ({ children, teamMember }: { children: ReactNode; teamMember: TeamMember | null }) => (
  <TeamMemberContext.Provider value={{ teamMember }}>
    {children}
  </TeamMemberContext.Provider>
);

export const useTeamMember = () => {
  const context = useContext(TeamMemberContext);
  if (!context) throw new Error('useTeamMember must be used within TeamMemberProvider');
  return context;
}; 