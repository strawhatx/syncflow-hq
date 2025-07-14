import { useEffect, useState, useCallback } from "react";
import { InviteModal } from "./components/InviteModal";
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
import { TeamMemberWithProfile, TeamRole } from "@/types/team";
import { useHeaderContent } from "@/contexts/HeaderContentContext";

export const Teams = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const { setContent } = useHeaderContent();

    const {
        members: teamMembers,
        loading: isLoading,
        initialLoading,
        currentMember: teamMember,
        updateMemberRole,
        removeMember
    } = useTeam();

    // Call useTeamStats once at the top level to maintain hook order
    const teamStats = useTeamStats(teamMembers);

    const headerContent = useCallback(() => (
        <TeamHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            canInviteMembers={true}
            onInviteClick={() => setShowInviteModal(true)}
        />
    ), [searchTerm]);

    // Effect for setting content
    useEffect(() => {
        setContent(headerContent());
    }, [headerContent, setContent]);

    // Separate effect for cleanup
    useEffect(() => {
        return () => { setContent(null) };
    }, [setContent]);

    if (initialLoading) return <div>Loading team data...</div>;
    if (isLoading) return <div>Loading...</div>;
    if (!teamMember) return <NoTeamFound />;

    const handleUpdateRole = (member: TeamMemberWithProfile) => {
        updateMemberRole(member.id, member.role as TeamRole);
    };

    const handleRemoveMember = (member: TeamMemberWithProfile) => {
        removeMember(member.id);
    };

    const MembersList = () => (
        <TeamMembersList
            members={teamMembers as TeamMemberWithProfile[]}
            renderMember={(member) => (
                <TeamMemberCard
                    key={member.id}
                    member={member as TeamMemberWithProfile}
                    onUpdateRole={handleUpdateRole}
                    onRemoveMember={handleRemoveMember}
                    onCopyEmail={(email) => navigator.clipboard.writeText(email)}
                    getRoleColor={getRoleColor}
                    getRoleIcon={getRoleIcon}
                    getMemberStatusColor={getMemberStatusColor}
                />
            )}
        />)

    const MainContent = () => (
        <div className="space-y-8">
            <TeamStats stats={teamStats}>
                <StatCard title="Total Members" type="total" stats={teamStats} />
                <StatCard title="Active Members" type="active" stats={teamStats} />
                <StatCard title="Pending Invites" type="pending" stats={teamStats} />
                <StatCard title="Admins" type="admins" stats={teamStats} />
            </TeamStats>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    {/* Render the component returned by withPermission as a JSX element */}
                    <MembersList />
                </div>
                <div>
                    <RolePermissions />
                </div>
            </div>

            <InviteModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
            />
        </div>
    )

    return (
     <MainContent />
    );
};