import { CheckCircle, Mail, Edit, Copy, Trash2 } from "lucide-react";
import { TeamMemberWithProfile } from "@/types/team";
import { useTeam } from "@/contexts/TeamContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMemberCardProps {
  member: TeamMemberWithProfile;
  onUpdateRole: (member: TeamMemberWithProfile) => void;
  onRemoveMember: (member: TeamMemberWithProfile) => void;
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
  const { canUpdateRole, canRemoveMember } = useTeam();

  const avatarFallback = member.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="p-4 border-t-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar_url || undefined} alt={member.username || 'User'} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-md font-semibold">{member.username || 'Anonymous'}</h3>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                Joined {new Date(member.created_at).toLocaleDateString()}
              </span>

              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                {getRoleIcon(member.role)}
                <span className="capitalize">{member.role}</span>
              </div>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onUpdateRole(member)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCopyEmail(member.email)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            {canRemoveMember && member.role !== 'owner' && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemoveMember(member)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}; 