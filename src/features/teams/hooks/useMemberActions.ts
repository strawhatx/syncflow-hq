import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useMemberActions = () => {

    const handleUpdateRole = useCallback(async (member, newRole) => {
        try {
            const { error } = await supabase
                .from('team_members')
                .update({ role: newRole })
                .eq('id', member.id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Role updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update role",
                variant: "destructive",
            });
        }
    }, []);

    const handleRemoveMember = useCallback(async (member) => {
        try {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', member.id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Member removed successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove member",
                variant: "destructive",
            });
        }
    }, []);

    const handleCopyEmail = useCallback((email) => {
        try {
            navigator.clipboard.writeText(email);
            toast({
                title: "Success",
                description: "Email copied to clipboard",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to copy email",
                variant: "destructive",
            });
        }
    }, []);

    return {
        handleUpdateRole,
        handleRemoveMember,
        handleCopyEmail
    };
}; 