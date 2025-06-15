import { CheckCircle, Mail, Edit, Copy, Trash2 } from "lucide-react";
import { useTeamMember } from "@/hooks/useTeamMember";
import { hasPermission } from "@/lib/permissions";
import { TeamMember } from "@/types/team";

interface TeamMemberCardProps {
  member: TeamMember;
  onUpdateRole: (member: TeamMember) => void;
  onRemoveMember: (member: TeamMember) => void;
  onCopyEmail: (email: string) => void;
  getRoleColor: (role: string) => string;
  getRoleIcon: (role: string) => React.ReactNode;
  getMemberStatusColor: (status: string) => string;
}

export const TeamMemberCard = ({
  member,
  onUpdateRole,
  onRemoveMember,
  onCopyEmail,
  getRoleColor,
  getRoleIcon,
  getMemberStatusColor
}: TeamMemberCardProps) => {
  const { teamMember } = useTeamMember();
  
  const canUpdateRole = hasPermission(teamMember, "team_members", "update_role", member);
  const canRemoveMember = hasPermission(teamMember, "team_members", "remove", member);

  return (
    <div className="p-6 hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {member.avatar}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">{member.name}</h3>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                {getRoleIcon(member.role)}
                <span className="capitalize">{member.role}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">{member.email}</p>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-gray-500 text-xs">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </span>
              <span className="text-gray-500 text-xs">
                Last active: {member.lastActive}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMemberStatusColor(member.status)}`}>
            {member.status === 'active' && <CheckCircle className="h-3 w-3 inline mr-1" />}
            {member.status === 'invited' && <Mail className="h-3 w-3 inline mr-1" />}
            <span className="capitalize">{member.status}</span>
          </div>
          <div className="flex items-center space-x-1">
            {canUpdateRole && (
              <button 
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => onUpdateRole(member)}
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            <button 
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => onCopyEmail(member.email)}
            >
              <Copy className="h-4 w-4" />
            </button>
            {canRemoveMember && member.role !== 'owner' && (
              <button 
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                onClick={() => onRemoveMember(member)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 