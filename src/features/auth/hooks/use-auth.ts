import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import type { LoginFormValues, RegisterFormValues, RegisterWithInviteFormValues } from "../util/schemas";

export const useAuth = () => {
  const { user, signIn, signUp, signUpWithInvite, isLoading: authLoading } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await signUp(data.email, data.password);
      toast({
        title: "Account created",
        description: "Please sign in with your new account.",
      });
      return true; // Return true to indicate successful registration
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Please try again with different credentials.",
      });
      return false; // Return false to indicate failed registration
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterWithInvite = async (data: RegisterWithInviteFormValues) => {
    setIsSubmitting(true);
    try {
      await signUpWithInvite(data.email, data.password, data.invite_code);
      toast({
        title: "Account created",
        description: "Please sign in with your new account.",
      });
      return true; // Return true to indicate successful registration
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Please try again with different credentials.",
      });
      return false; // Return false to indicate failed registration
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user,
    isLoading: authLoading,
    isSubmitting,
    handleLogin,
    handleRegister,
    handleRegisterWithInvite,
  };
}; 