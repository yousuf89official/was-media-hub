import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";

export interface ServiceType {
  id: string;
  name: string;
  type_enum: string;
  description: string | null;
  icon_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type ServiceTypeEnum = "SocialMediaManagement" | "PaidMediaBuying" | "InfluencerMarketing" | "KOLManagement" | "BrandActivation" | "ProgrammaticDisplay" | "ProgrammaticSocial" | "RetailMedia" | "SEO" | "SEM" | "CRO" | "AnalyticsAndReporting";

type ServiceTypeInsert = {
  name: string;
  type_enum: ServiceTypeEnum;
  description?: string;
  icon_name?: string;
  is_active?: boolean;
};

type ServiceTypeUpdate = Partial<Omit<ServiceTypeInsert, 'type_enum'>> & {
  type_enum?: ServiceTypeEnum;
};

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ["service-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as ServiceType[];
    },
  });
};

export const useCreateServiceType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceType: ServiceTypeInsert) => {
      const { data, error } = await supabase
        .from("service_types")
        .insert([serviceType])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      toast.success("Service type created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create service type");
    },
  });
};

export const useUpdateServiceType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ServiceTypeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("service_types")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      toast.success("Service type updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update service type");
    },
  });
};

export const useDeleteServiceType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_types")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      toast.success("Service type deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete service type");
    },
  });
};
