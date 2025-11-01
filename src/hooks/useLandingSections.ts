import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLandingSections = () => {
  return useQuery({
    queryKey: ["landing-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .order("display_order");
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useLandingSection = (sectionKey: string) => {
  return useQuery({
    queryKey: ["landing-sections", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .eq("section_key", sectionKey)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      sectionKey,
      content,
    }: {
      sectionKey: string;
      content: any;
    }) => {
      const { data, error } = await supabase
        .from("landing_sections")
        .update({ content })
        .eq("section_key", sectionKey)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-sections"] });
      toast.success("Section updated successfully");
    },
    onError: () => {
      toast.error("Failed to update section");
    },
  });
};
