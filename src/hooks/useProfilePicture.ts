import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
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

      // Store the object path; the bucket is private and read via signed URLs
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_picture_url: filePath })
        .eq("id", userId);

      if (updateError) throw updateError;

      return filePath;

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
