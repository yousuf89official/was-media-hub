import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProducts = (brandId?: string) => {
  return useQuery({
    queryKey: ["products", brandId],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          brand:brands(id, name)
        `)
        .order("name", { ascending: true });
      
      if (brandId) {
        query = query.eq("brand_id", brandId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: { name: string; brand_id: string; category?: string }) => {
      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product");
    },
  });
};
