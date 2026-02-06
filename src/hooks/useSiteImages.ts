import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";

export const useSiteImages = () => {
  return useQuery({
    queryKey: ["site-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_images")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSiteImage = (name: string) => {
  return useQuery({
    queryKey: ["site-images", name],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_images")
        .select("*")
        .eq("name", name)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUploadImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      file,
      name,
      altText,
      usageLocation,
    }: {
      file: File;
      name: string;
      altText?: string;
      usageLocation?: string;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${name}-${Date.now()}.${fileExt}`;
      const filePath = `${usageLocation || 'general'}/${fileName}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);
      
      // Create database record
      const { data, error } = await supabase
        .from("site_images")
        .insert({
          name,
          storage_path: filePath,
          url: publicUrl,
          alt_text: altText,
          usage_location: usageLocation,
          file_size: file.size,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-images"] });
      toast.success("Image uploaded successfully");
    },
    onError: (error) => {
      toast.error("Failed to upload image");
      console.error(error);
    },
  });
};

export const useUpdateImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      id,
      altText,
      usageLocation,
    }: {
      id: string;
      altText?: string;
      usageLocation?: string;
    }) => {
      const { data, error } = await supabase
        .from("site_images")
        .update({ alt_text: altText, usage_location: usageLocation })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-images"] });
      toast.success("Image updated successfully");
    },
    onError: () => {
      toast.error("Failed to update image");
    },
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("site-assets")
        .remove([storagePath]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error } = await supabase
        .from("site_images")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-images"] });
      toast.success("Image deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete image");
    },
  });
};
