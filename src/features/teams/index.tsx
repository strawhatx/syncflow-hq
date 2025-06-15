import { useState } from "react";
import { hasPermission } from "@/lib/permissions";
import InviteModal from "./components/InviteModal";
import { useTeamMembers } from "./hooks/useTeamMembers";
import { useTeamMember } from "@/hooks/useTeamMember";
import { useTeamStats } from "./hooks/useTeamStats";
import { TeamStats } from "./components/TeamStats";
import { TeamMemberCard } from "./components/TeamMemberCard";
import { useMemberActions } from "./hooks/useMemberActions";
import { TeamProvider } from "./context/TeamContext";
import { getRoleIcon, getRoleColor, getMemberStatusColor } from './utils/roleUtils';
import { TeamMembersList } from "./components/TeamMembersList";
import { StatCard } from "./components/StatCard";
import { RolePermissions } from "./components/RolePermissions";
import { TeamHeader } from "./components/TeamHeader";
import { NoTeamFound } from "./components/NoTeamFound";

const Teams = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const { teamMembers, isLoading } = useTeamMembers();
    const { teamMember } = useTeamMember();
    const { handleUpdateRole, handleRemoveMember, handleCopyEmail } = useMemberActions();

    if (isLoading) return <div>Loading...</div>;

    if (!teamMember) return <NoTeamFound />;
    
    return (
        <TeamProvider>
            <div className="space-y-8">
                <TeamHeader
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    canInviteMembers={hasPermission(teamMember, "teams", "invite_member")}
                    onInviteClick={() => setShowInviteModal(true)}
                />
                
                <TeamStats stats={useTeamStats(teamMembers)}>
                    <StatCard title="Total Members" type="total" stats={useTeamStats(teamMembers)} />
                    <StatCard title="Active Members" type="active" stats={useTeamStats(teamMembers)} />
                    <StatCard title="Pending Invites" type="pending" stats={useTeamStats(teamMembers)} />
                    <StatCard title="Admins" type="admins" stats={useTeamStats(teamMembers)} />
                </TeamStats>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <TeamMembersList 
                            members={teamMembers}
                            renderMember={(member) => (
                                <TeamMemberCard 
                                    key={member.id}
                                    member={member}
                                    onUpdateRole={(member) => handleUpdateRole(member, 'admin')}
                                    onRemoveMember={handleRemoveMember}
                                    onCopyEmail={handleCopyEmail}
                                    getRoleColor={getRoleColor}
                                    getRoleIcon={getRoleIcon}
                                    getMemberStatusColor={getMemberStatusColor}
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-6">
                        <RolePermissions />
                    </div>
                </div>

                <InviteModal 
                    isOpen={showInviteModal} 
                    onClose={() => setShowInviteModal(false)} 
                />
            </div>
        </TeamProvider>
    );
};

export default Teams;