import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Define validation schema
const inviteCodeSchema = z.object({
    inviteCode: z.string()
        .min(1, 'Invite code is required')
        .min(6, 'Invite code must be at least 6 characters')
        .max(50, 'Invite code is too long')
        .regex(/^[a-zA-Z0-9-_]+$/, 'Invite code can only contain letters, numbers, hyphens, and underscores')
});

export default function JoinTeam() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [inviteCode, setInviteCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateInviteCode = (code: string) => {
        try {
            inviteCodeSchema.parse({ inviteCode: code });
            setError(null);
            return true;
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                setError(validationError.errors[0].message);
            }
            return false;
        }
    };

    const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCode = e.target.value;
        setInviteCode(newCode);
        
        // Clear error when user starts typing
        if (error) {
            setError(null);
        }
        
        // Validate when code is longer than 5 characters
        if (newCode.length > 5) {
            validateInviteCode(newCode);
        }
    };

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validate invite code before proceeding
        if (!validateInviteCode(inviteCode)) {
            return;
        }

        setIsLoading(true);
        try {
            // Check if invite code is valid
            // meaning it must be an active invite and the email must 
            // be the same as the user's email
            const { data: invite, error: inviteError } = await supabase
                .from('team_invites')
                .select('*, teams(*)')
                .eq('code', inviteCode)
                .eq('status', 'active')
                .eq('email', user.email)
                .single();

            if (inviteError || !invite) {
                throw new Error('Invalid invite code');
            }

            // Add user to team
            const { error: memberError } = await supabase
                .from('view_team_members')
                .insert({
                    team_id: invite.team_id,
                    user_id: user.id,
                    role: 'member',
                    status: 'active'
                });

            if (memberError) throw memberError;

            toast({
                title: "Success",
                description: "You have joined the team successfully",
            });

            navigate('/teams');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to join team. Please check your invite code.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTeam = () => {
        navigate('/teams/create');
    };

    return (
        <div className="container max-w-md mx-auto py-12">
            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-6">Join a Team</h1>
                <p className="text-muted-foreground mb-6">
                    You need to be part of a team to access this application. 
                    Either join an existing team or create your own.
                </p>
                
                <form onSubmit={handleJoinTeam} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="inviteCode" className="block text-sm font-medium mb-2">
                            Team Invite Code
                        </label>
                        <Input
                            id="inviteCode"
                            value={inviteCode}
                            onChange={handleInviteCodeChange}
                            onBlur={() => validateInviteCode(inviteCode)}
                            placeholder="Enter invite code"
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>
                    
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading || !inviteCode.trim() || !!error}
                    >
                        {isLoading ? 'Joining...' : 'Join Team'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">Don't have an invite?</p>
                    <Button 
                        variant="outline" 
                        onClick={handleCreateTeam}
                        className="w-full"
                    >
                        Create Your Own Team
                    </Button>
                </div>
            </Card>
        </div>
    );
} 