import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/contexts/TeamContext';
import { z } from 'zod';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Define validation schema
const inviteSchema = z.object({
    email: z.string()
        .email('Please enter a valid email address')
        .min(1, 'Email is required')
        .max(255, 'Email is too long')
});

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { team, loadTeam, inviteMember } = useTeam();
    const { toast } = useToast();

    const validateEmail = (email: string) => {
        try {
            inviteSchema.parse({ email });
            setError(null);
            return true;
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                setError(validationError.errors[0].message);
            }
            return false;
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        
        // Clear error when user starts typing
        if (error) {
            setError(null);
        }
        
        // Validate on blur or when email is complete
        if (newEmail.includes('@')) {
            validateEmail(newEmail);
        }
    };

    const handleInvite = async () => {
        if (!team) return;
        
        // Validate email before proceeding
        if (!validateEmail(email)) {
            return;
        }
        
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
            setError(null);
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
                    <div className="space-y-2">
                        <Input
                            placeholder="Enter email address"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={() => validateEmail(email)}
                            type="email"
                            autoFocus
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleInvite}
                        disabled={!email || loading || !!error}
                    >
                        {loading ? "Sending..." : "Send Invite"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 