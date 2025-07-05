import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { z } from 'zod';
import { sanitizeField } from '@/lib/sanitize';

// Define validation schema
const teamNameSchema = z.object({
    teamName: z.string()
        .min(1, 'Team name is required')
        .min(2, 'Team name must be at least 2 characters')
        .max(50, 'Team name must be less than 50 characters')
        .regex(/^[a-zA-Z0-9\s-_]+$/, 'Team name can only contain letters, numbers, spaces, hyphens, and underscores')
});

export const NoTeamFound = () => {
    const { createTeamWithOwner, loading: isLoading } = useTeam();
    const { user } = useAuth();
    const [teamName, setTeamName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateTeamName = (name: string) => {
        try {
            teamNameSchema.parse({ teamName: name });
            setError(null);
            return true;
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                setError(validationError.errors[0].message);
            }
            return false;
        }
    };

    const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Sanitize the team name first
        const newName = sanitizeField(e.target.value, "text", { maxLength: 50 });
        setTeamName(newName);
        
        // Clear error when user starts typing
        if (error) setError(null);
        
        // Validate when name is longer than 1 character
        if (newName.length > 1)
            validateTeamName(newName);
    };

    const handleCreateTeam = async () => {
        if (!validateTeamName(teamName.trim())) {
            return;
        }
        await createTeamWithOwner(user.id, teamName.trim());
        setIsOpen(false);
        setTeamName('');
        setError(null);
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
                            <div className="py-4 space-y-2">
                                <Input
                                    placeholder="Team name"
                                    value={teamName}
                                    onChange={handleTeamNameChange}
                                    onBlur={() => validateTeamName(teamName)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isLoading && !error) {
                                            handleCreateTeam();
                                        }
                                    }}
                                    className={error ? 'border-red-500' : ''}
                                />
                                {error && (
                                    <p className="text-sm text-red-500">{error}</p>
                                )}
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
                                    disabled={isLoading || !teamName.trim() || !!error}
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