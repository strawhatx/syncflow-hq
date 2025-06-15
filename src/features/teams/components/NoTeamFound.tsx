import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export const NoTeamFound = () => {
    const { createTeamWithOwner, loading: isLoading } = useTeam();
    const { user } = useAuth();
    const [teamName, setTeamName] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleCreateTeam = async () => {
        if (!teamName.trim()) return;
        await createTeamWithOwner(user.id, teamName.trim());
        setIsOpen(false);
        setTeamName('');
    };

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
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                size="sm" 
                                className="gap-1.5"
                            >
                                <Plus size={14} />
                                Create Team
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Team</DialogTitle>
                                <DialogDescription>
                                    Enter a name for your team. You can change this later.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    placeholder="Team name"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isLoading) {
                                            handleCreateTeam();
                                        }
                                    }}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateTeam}
                                    disabled={isLoading || !teamName.trim()}
                                >
                                    {isLoading ? 'Creating...' : 'Create Team'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
};