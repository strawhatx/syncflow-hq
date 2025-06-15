import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/contexts/TeamContext';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { team, loadTeam, inviteMember } = useTeam();
    const { toast } = useToast();

    const handleInvite = async () => {
        if (!team) return;
        
        try {
            setLoading(true);
            await inviteMember(email);
            toast({
                title: "Success",
                description: "Invitation sent successfully",
            });
            await loadTeam(team.id);
            onClose();
            setEmail('');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send invitation",
                variant: "destructive",
            });
            console.error('Invite error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleInvite}
                        disabled={!email || loading}
                    >
                        {loading ? "Sending..." : "Send Invite"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 