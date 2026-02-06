import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useEmailChange = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (newEmail: string) => {
      // Check if email is already taken
      const { data: existing } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", newEmail)
        .maybeSingle();

      if (existing) {
        throw new Error("This email is already registered");
      }

      // Trigger email change with verification
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: `${window.location.origin}/verify-email?type=email_change&email=${encodeURIComponent(newEmail)}`,
        }
      );

      if (error) throw error;
      return newEmail;
    },
    onSuccess: (newEmail) => {
      toast.success("Verification code sent to your new email address");
      navigate(`/verify-email?type=email_change&email=${encodeURIComponent(newEmail)}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update email");
    },
  });
};
