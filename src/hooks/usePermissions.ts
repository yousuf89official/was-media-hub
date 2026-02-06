import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/safeClient";

export interface UserPermissions {
  featureCode: string;
  featureName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface UserAssignment {
  id: string;
  userId: string;
  userType: 'agency' | 'client' | 'guest';
  jobTitleId: string | null;
  jobTitle?: {
    id: string;
    name: string;
    code: string;
    department?: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export const usePermissions = () => {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: userAssignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ["user-assignment", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("user_job_assignments")
        .select(`
          id,
          user_id,
          user_type,
          job_title_id,
          job_titles:job_title_id (
            id,
            name,
            code,
            departments:department_id (
              id,
              name,
              code
            )
          )
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        userId: data.user_id,
        userType: data.user_type as 'agency' | 'client' | 'guest',
        jobTitleId: data.job_title_id,
        jobTitle: data.job_titles ? {
          id: (data.job_titles as any).id,
          name: (data.job_titles as any).name,
          code: (data.job_titles as any).code,
          department: (data.job_titles as any).departments ? {
            id: (data.job_titles as any).departments.id,
            name: (data.job_titles as any).departments.name,
            code: (data.job_titles as any).departments.code,
          } : undefined
        } : undefined
      } as UserAssignment;
    },
    enabled: !!user?.id,
  });

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc("get_user_accessible_features", { _user_id: user.id });

      if (error) throw error;
      
      return (data || []).map((p: any) => ({
        featureCode: p.feature_code,
        featureName: p.feature_name,
        canView: p.can_view,
        canCreate: p.can_create,
        canEdit: p.can_edit,
        canDelete: p.can_delete,
        canExport: p.can_export,
      })) as UserPermissions[];
    },
    enabled: !!user?.id,
  });

  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.role || null;
    },
    enabled: !!user?.id,
  });

  const isMasterAdmin = userRole === "MasterAdmin";

  const canView = (featureCode: string): boolean => {
    if (isMasterAdmin) return true;
    return permissions?.some(p => p.featureCode === featureCode && p.canView) || false;
  };

  const canCreate = (featureCode: string): boolean => {
    if (isMasterAdmin) return true;
    return permissions?.some(p => p.featureCode === featureCode && p.canCreate) || false;
  };

  const canEdit = (featureCode: string): boolean => {
    if (isMasterAdmin) return true;
    return permissions?.some(p => p.featureCode === featureCode && p.canEdit) || false;
  };

  const canDelete = (featureCode: string): boolean => {
    if (isMasterAdmin) return true;
    return permissions?.some(p => p.featureCode === featureCode && p.canDelete) || false;
  };

  const canExport = (featureCode: string): boolean => {
    if (isMasterAdmin) return true;
    return permissions?.some(p => p.featureCode === featureCode && p.canExport) || false;
  };

  const hasAnyPermission = (featureCode: string): boolean => {
    if (isMasterAdmin) return true;
    return permissions?.some(p => 
      p.featureCode === featureCode && 
      (p.canView || p.canCreate || p.canEdit || p.canDelete || p.canExport)
    ) || false;
  };

  return {
    user,
    userAssignment,
    userType: userAssignment?.userType || 'guest',
    jobTitle: userAssignment?.jobTitle,
    department: userAssignment?.jobTitle?.department,
    permissions: permissions || [],
    isMasterAdmin,
    isLoading: assignmentLoading || permissionsLoading,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    hasAnyPermission,
  };
};
