import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PRSetting {
  id: string;
  setting_key: string;
  setting_value: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const usePRSettings = () => {
  return useQuery({
    queryKey: ["pr_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pr_settings")
        .select("*");
      
      if (error) throw error;
      return data as PRSetting[];
    },
  });
};

export const useECPMValue = () => {
  return useQuery({
    queryKey: ["ecpm_value"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pr_settings")
        .select("setting_value")
        .eq("setting_key", "ecpm")
        .single();
      
      if (error) throw error;
      return data.setting_value as number;
    },
  });
};

export const useUpdateECPM = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newValue: number) => {
      const { data, error } = await supabase
        .from("pr_settings")
        .update({ setting_value: newValue })
        .eq("setting_key", "ecpm")
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pr_settings"] });
      queryClient.invalidateQueries({ queryKey: ["ecpm_value"] });
      toast.success("eCPM value updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update eCPM: ${error.message}`);
    },
  });
};
