import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { sanitizeField } from "@/lib/sanitize";

// Component for team header
export const TeamHeader = ({ searchTerm, onSearchChange, canInviteMembers, onInviteClick }) => (
    <div className="flex items-center">
        <div className="flex items-center space-x-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(sanitizeField(e.target.value, "text", { maxLength: 100 }))}
                    className="pl-10 pr-4 py-1 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
            </div>
            {canInviteMembers && (
                <Button
                    onClick={onInviteClick}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                >
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                </Button>
            )}
        </div>
    </div>
);