import { supabase } from "@/integrations/supabase/client";

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload PNG, JPG, SVG, or WebP images.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size exceeds 2MB. Please upload a smaller image.",
    };
  }

  return { valid: true };
};

export const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
  return data.publicUrl;
};

export const uploadImageToStorage = async (
  file: File,
  folder: string = "general"
): Promise<{ path: string; url: string }> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const url = getPublicUrl(filePath);
  return { path: filePath, url };
};

export const deleteImageFromStorage = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from("site-assets").remove([path]);
  if (error) throw error;
};
