import { Eye, Shield, UserCheck, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Component for role item
const RoleItem = ({ icon, title, description }) => (
    <div className="flex items-center space-x-3">
        <div className="bg-secondary/50 p-2 rounded-lg">
            {icon}
        </div>
        <div>
            <div className="font-medium">{title}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
        </div>
    </div>
);

// Component for role permissions
export const RolePermissions = () => (
    <Card>
        <CardHeader>
            <CardTitle className="text-xl font-semibold">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
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
                    title="Member"
                    description="Create and edit sync flows"
                />
            </div>
        </CardContent>
    </Card>
);