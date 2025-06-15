import { Eye, Shield, UserCheck, Crown } from "lucide-react";

// Component for role item
const RoleItem = ({ icon, title, description }) => (
    <div className="flex items-center space-x-3">
        <div className="bg-white/10 p-2 rounded-lg">
            {icon}
        </div>
        <div>
            <div className="text-white font-medium">{title}</div>
            <div className="text-gray-400 text-sm">{description}</div>
        </div>
    </div>
);

// Component for role permissions
export const RolePermissions = () => (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Role Permissions</h2>
        </div>
        <div className="p-6">
            <div className="space-y-4">
                <RoleItem 
                    icon={<Crown className="h-5 w-5 text-yellow-400" />}
                    title="Owner"
                    description="Full access to everything"
                />
                <RoleItem 
                    icon={<Shield className="h-5 w-5 text-blue-400" />}
                    title="Admin"
                    description="Manage flows, connectors, team"
                />
                <RoleItem 
                    icon={<UserCheck className="h-5 w-5 text-green-400" />}
                    title="Developer"
                    description="Create and edit sync flows"
                />
                <RoleItem 
                    icon={<Eye className="h-5 w-5 text-gray-400" />}
                    title="Viewer"
                    description="Read-only access"
                />
            </div>
        </div>
    </div>
);