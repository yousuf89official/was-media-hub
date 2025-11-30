import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreativeDB {
  id: string;
  campaign_id: string;
  placement_id: string | null;
  name: string;
  image_url: string | null;
  video_url: string | null;
  headline: string | null;
  description: string | null;
  cta_text: string | null;
  display_url: string | null;
  storage_path: string | null;
  source: 'organic' | 'paid' | 'kol';
  is_collaboration: boolean;
  is_boosted: boolean;
  metrics: Record<string, number>;
  created_at: string;
  updated_at: string;
  placement?: {
    id: string;
    name: string;
    mock_type: string;
    channel_id: string;
    aspect_ratio: string | null;
  };
}

export interface CreateCreativeInput {
  campaign_id: string;
  placement_id?: string;
  name: string;
  image_url?: string;
  video_url?: string;
  headline?: string;
  description?: string;
  cta_text?: string;
  display_url?: string;
  storage_path?: string;
  source: 'organic' | 'paid' | 'kol';
  is_collaboration?: boolean;
  is_boosted?: boolean;
  metrics?: Record<string, number>;
}

export const useCreatives = (campaignId?: string) => {
  return useQuery({
    queryKey: ["creatives", campaignId],
    queryFn: async () => {
      let query = supabase
        .from("creatives")
        .select(`
          *,
          placement:placements(id, name, mock_type, channel_id, aspect_ratio)
        `)
        .order("created_at", { ascending: false });

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CreativeDB[];
    },
    enabled: true,
  });
};

export const useCreative = (id: string) => {
  return useQuery({
    queryKey: ["creative", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creatives")
        .select(`
          *,
          placement:placements(id, name, mock_type, channel_id, aspect_ratio)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as CreativeDB | null;
    },
    enabled: !!id,
  });
};

export const useCreateCreative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCreativeInput) => {
      const { data, error } = await supabase
        .from("creatives")
        .insert([input])
        .select(`
          *,
          placement:placements(id, name, mock_type, channel_id, aspect_ratio)
        `)
        .single();

      if (error) throw error;
      return data as CreativeDB;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
      queryClient.invalidateQueries({ queryKey: ["creatives", data.campaign_id] });
      toast.success("Creative uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload creative");
    },
  });
};

export const useUpdateCreative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CreateCreativeInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("creatives")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          placement:placements(id, name, mock_type, channel_id, aspect_ratio)
        `)
        .single();

      if (error) throw error;
      return data as CreativeDB;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
      queryClient.invalidateQueries({ queryKey: ["creatives", data.campaign_id] });
      queryClient.invalidateQueries({ queryKey: ["creative", data.id] });
      toast.success("Creative updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update creative");
    },
  });
};

export const useDeleteCreative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath?: string | null }) => {
      // Delete file from storage if exists
      if (storagePath) {
        await supabase.storage.from("creatives").remove([storagePath]);
      }

      const { error } = await supabase
        .from("creatives")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
      toast.success("Creative deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete creative");
    },
  });
};

// Helper to upload file to storage
export const uploadCreativeFile = async (file: File, campaignId: string): Promise<{ path: string; url: string }> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${campaignId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("creatives")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("creatives").getPublicUrl(fileName);
  return { path: fileName, url: data.publicUrl };
};
