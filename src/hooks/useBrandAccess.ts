import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BrandAccessGrant {
  id: string;
  userId: string;
  brandId: string;
  accessLevel: 'view' | 'edit' | 'admin';
  grantedBy: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  brand?: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const useBrandAccess = (userId?: string) => {
  return useQuery({
    queryKey: ["brand-access", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("brand_access_grants")
        .select(`
          id,
          user_id,
          brand_id,
          access_level,
          granted_by,
          expires_at,
          is_active,
          created_at,
          brands:brand_id (
            id,
            name,
            logo_url
          )
        `)
        .eq("user_id", userId)
        .eq("is_active", true);

      if (error) throw error;
      
      return (data || []).map((grant: any) => ({
        id: grant.id,
        userId: grant.user_id,
        brandId: grant.brand_id,
        accessLevel: grant.access_level as 'view' | 'edit' | 'admin',
        grantedBy: grant.granted_by,
        expiresAt: grant.expires_at,
        isActive: grant.is_active,
        createdAt: grant.created_at,
        brand: grant.brands ? {
          id: grant.brands.id,
          name: grant.brands.name,
          logoUrl: grant.brands.logo_url,
        } : undefined
      })) as BrandAccessGrant[];
    },
    enabled: !!userId,
  });
};

export const useBrandAccessByBrand = (brandId?: string) => {
  return useQuery({
    queryKey: ["brand-access-by-brand", brandId],
    queryFn: async () => {
      if (!brandId) return [];
      
      const { data, error } = await supabase
        .from("brand_access_grants")
        .select(`
          id,
          user_id,
          brand_id,
          access_level,
          granted_by,
          expires_at,
          is_active,
          created_at,
          profiles:user_id (
            id,
            name,
            email
          )
        `)
        .eq("brand_id", brandId)
        .eq("is_active", true);

      if (error) throw error;
      
      return (data || []).map((grant: any) => ({
        id: grant.id,
        userId: grant.user_id,
        brandId: grant.brand_id,
        accessLevel: grant.access_level as 'view' | 'edit' | 'admin',
        grantedBy: grant.granted_by,
        expiresAt: grant.expires_at,
        isActive: grant.is_active,
        createdAt: grant.created_at,
        user: grant.profiles ? {
          id: grant.profiles.id,
          name: grant.profiles.name,
          email: grant.profiles.email,
        } : undefined
      })) as BrandAccessGrant[];
    },
    enabled: !!brandId,
  });
};

export const useGrantBrandAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      brandId,
      accessLevel,
      expiresAt,
    }: {
      userId: string;
      brandId: string;
      accessLevel: 'view' | 'edit' | 'admin';
      expiresAt?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("brand_access_grants")
        .upsert({
          user_id: userId,
          brand_id: brandId,
          access_level: accessLevel,
          granted_by: user?.id,
          expires_at: expiresAt,
          is_active: true,
        }, {
          onConflict: "user_id,brand_id"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-access"] });
      queryClient.invalidateQueries({ queryKey: ["brand-access-by-brand"] });
      toast.success("Brand access granted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to grant brand access");
    },
  });
};

export const useRevokeBrandAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (grantId: string) => {
      const { error } = await supabase
        .from("brand_access_grants")
        .update({ is_active: false })
        .eq("id", grantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-access"] });
      queryClient.invalidateQueries({ queryKey: ["brand-access-by-brand"] });
      toast.success("Brand access revoked");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to revoke brand access");
    },
  });
};

export const useCanAccessBrand = (brandId?: string) => {
  return useQuery({
    queryKey: ["can-access-brand", brandId],
    queryFn: async () => {
      if (!brandId) return false;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .rpc("can_access_brand", { 
          _user_id: user.id, 
          _brand_id: brandId,
          _access_level: 'view'
        });

      if (error) throw error;
      return data as boolean;
    },
    enabled: !!brandId,
  });
};
