import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useTeam} from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";

export const NoTeamFound = () => {
    const { createTeamWithOwner, loading: isLoading } = useTeam();
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center h-[90vh] px-4">
            <Card className="w-full max-w-sm border-0 bg-muted/50">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-md font-medium">No Team Found</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Get started by creating your team.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-4">
                    <Button 
                        onClick={() => createTeamWithOwner(user.id, 'My Team')} 
                        size="sm" 
                        className="gap-1.5"
                        disabled={isLoading}
                    >
                        <Plus size={14} />
                        {isLoading ? 'Creating...' : 'Create Team'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};