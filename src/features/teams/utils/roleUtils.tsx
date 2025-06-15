import { Shield, User, Users } from "lucide-react";
import { TeamRole, TeamMemberStatus } from "@/types/team";

export const getRoleColor = (role: TeamRole) => {
    switch (role) {
        case 'owner': return 'bg-yellow-500/20 text-yellow-400';
        case 'admin': return 'bg-blue-500/20 text-blue-400';
        case 'member': return 'bg-green-500/20 text-green-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};

export const getRoleIcon = (role: TeamRole) => {
    switch (role) {
        case 'owner': return <Shield className="w-4 h-4" />;
        case 'admin': return <Users className="w-4 h-4" />;
        case 'member': return <User className="w-4 h-4" />;
        default: return <User className="w-4 h-4" />;
    }
};

export const getMemberStatusColor = (status: TeamMemberStatus) => {
    switch (status) {
        case 'active': return 'bg-green-500/20 text-green-400';
        case 'invited': return 'bg-yellow-500/20 text-yellow-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
}; 