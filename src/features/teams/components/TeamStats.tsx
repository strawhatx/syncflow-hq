import { ReactNode } from 'react';

interface TeamStatsProps {
  stats: {
    totalMembers: number;
    activeMembers: number;
    pendingInvites: number;
    admins: number;
  };
  children: ReactNode;
}

export const TeamStats = ({ stats, children }: TeamStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}; 