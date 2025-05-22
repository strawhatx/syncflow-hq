import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  avatar: string | null;
  avatar_backup: string;
  full_name: string;
  email: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile({
            avatar: data.avatar_url,
            avatar_backup: data.username?.[0]?.toUpperCase() || "U",
            full_name: data.username || "Anonymous",
            email: user.email || "Not available"
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }

    loadProfile();
  }, [user]);

  return { profile };
} 