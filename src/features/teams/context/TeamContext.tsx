import { createContext, useContext, ReactNode } from 'react';
import { TeamMember } from '@/types/team';

interface TeamContextType {
  getRoleColor: (role: string) => string;
  getRoleIcon: (role: string) => React.ReactNode;
  getMemberStatusColor: (status: string) => string;
  handleUpdateRole: (member: TeamMember) => Promise<void>;
  handleRemoveMember: (member: TeamMember) => Promise<void>;
  handleCopyEmail: (email: string) => void;
}

const TeamContext = createContext<TeamContextType | null>(null);

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  // Move all utility functions and handlers here
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-500/20 text-yellow-400';
      case 'admin': return 'bg-blue-500/20 text-blue-400';
      case 'member': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // ... other utility functions and handlers

  return (
    <TeamContext.Provider value={{
      getRoleColor,
      getRoleIcon,
      getMemberStatusColor,
      handleUpdateRole,
      handleRemoveMember,
      handleCopyEmail
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
}; 