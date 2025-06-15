import { useState } from "react";
import InviteModal from "./components/InviteModal";
import { useTeam, TeamProvider } from "@/contexts/TeamContext";
import { useTeamStats } from "./hooks/useTeamStats";
import { TeamStats } from "./components/TeamStats";
import { TeamMemberCard } from "./components/TeamMemberCard";
import { TeamMembersList } from "./components/TeamMembersList";
import { StatCard } from "./components/StatCard";
import { RolePermissions } from "./components/RolePermissions";
import { TeamHeader } from "./components/TeamHeader";
import { NoTeamFound } from "./components/NoTeamFound";
import { getRoleColor, getRoleIcon, getMemberStatusColor } from "./utils/roleUtils";

const TeamsContent = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const { 
        members: teamMembers, 
        loading: isLoading, 
        currentMember: teamMember, 
        updateMemberRole, 
        removeMember, 
        canInviteMembers,
        inviteMember 
    } = useTeam();

    if (isLoading) return <div>Loading...</div>;
    if (!teamMember) return <NoTeamFound />;

    return (
        <div className="space-y-8">
            <TeamHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                canInviteMembers={canInviteMembers()}
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
                                onUpdateRole={(member) => updateMemberRole(member.id, 'admin')}
                                onRemoveMember={(member) => removeMember(member.id)}
                                onCopyEmail={(email) => navigator.clipboard.writeText(email)}
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
                onInvite={inviteMember}
            />
        </div>
    );
};

const Teams = () => (
    <TeamProvider>
        <TeamsContent />
    </TeamProvider>
);

export default Teams;