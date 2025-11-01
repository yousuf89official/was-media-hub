import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUsernameCheck = (username: string, currentUserId: string) => {
  return useQuery({
    queryKey: ["username-check", username],
    queryFn: async () => {
      if (!username || username.length < 3) return { available: false };

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .neq("id", currentUserId)
        .maybeSingle();

      if (error) throw error;
      return { available: !data };
    },
    enabled: username.length >= 3,
    staleTime: 500,
  });
};
