import { TeamMember } from "@/types/team";

interface TeamMembersListProps {
  members: TeamMember[];
  renderMember: (member: TeamMember) => React.ReactNode;
}

export const TeamMembersList = ({ members, renderMember }: TeamMembersListProps) => (
  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
    <div className="px-6 py-4 border-b border-white/10">
      <h2 className="text-xl font-semibold text-white">Team Members</h2>
    </div>
    <div className="divide-y divide-white/10">
      {members.map(renderMember)}
    </div>
  </div>
); 