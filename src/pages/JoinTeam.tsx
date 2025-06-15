import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function JoinTeam() {
    const router = useRouter();
    const { user } = useAuth();
    const [inviteCode, setInviteCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            // Check if invite code is valid
            const { data: invite, error: inviteError } = await supabase
                .from('team_invites')
                .select('*, teams(*)')
                .eq('code', inviteCode)
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

            router.push('/teams');
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
        router.push('/teams/create');
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
                    <div>
                        <label htmlFor="inviteCode" className="block text-sm font-medium mb-2">
                            Team Invite Code
                        </label>
                        <Input
                            id="inviteCode"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            placeholder="Enter invite code"
                            required
                        />
                    </div>
                    
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
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