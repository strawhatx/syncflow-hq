import { supabase } from '@/integrations/supabase/client';

export const sendInviteEmail = async (email: string, verificationCode: string, teamName: string) => {
  try {
    await supabase.rpc('send-email', {
      subject: `Invitation to join ${teamName}`,
      email,
      message: `You have been invited to join ${teamName}. Please use the following verification code to join: ${verificationCode}`
    });
  } catch (error) {
    throw error;
  }
}
