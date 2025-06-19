import { TeamMemberWithProfile } from "@/types/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamMembersListProps {
  members: TeamMemberWithProfile[];
  renderMember: (member: TeamMemberWithProfile) => React.ReactNode;
}

export const TeamMembersList = ({ members, renderMember }: TeamMembersListProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl font-semibold">Team Members</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="divide-y divide-border">
      {members.map(renderMember)}
    </div>
    </CardContent>
  </Card>
); 