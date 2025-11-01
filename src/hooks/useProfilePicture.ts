import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfilePicture = () => {
  const queryClient = useQueryClient();

  const uploadPicture = useMutation({
    mutationFn: async ({ file, userId }: { file: File; userId: string }) => {
      // Delete old picture if exists
      const { data: oldFiles } = await supabase.storage
        .from("profile-pictures")
        .list(userId);

      if (oldFiles && oldFiles.length > 0) {
        await supabase.storage
          .from("profile-pictures")
          .remove(oldFiles.map(f => `${userId}/${f.name}`));
      }

      // Upload new picture
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      // Update profile with new URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_picture_url: data.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      return data.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile picture updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload picture");
    },
  });

  return { uploadPicture };
};
