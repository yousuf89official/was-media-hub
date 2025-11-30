import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface JobTitle {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  description: string | null;
  seniorityLevel: number;
  displayOrder: number;
  isActive: boolean;
  department?: Department;
}

export interface Feature {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  featureType: string;
  iconName: string | null;
  routePath: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface FeaturePermission {
  id: string;
  jobTitleId: string;
  featureId: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  customRules: Record<string, any>;
  feature?: Feature;
}

export interface UserWithAssignment {
  id: string;
  name: string;
  email: string;
  profilePictureUrl: string | null;
  createdAt: string;
  assignment?: {
    id: string;
    userType: 'agency' | 'client' | 'guest';
    jobTitleId: string | null;
    jobTitle?: JobTitle;
  };
  role?: string;
}

// Departments
export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("display_order");

      if (error) throw error;
      
      return (data || []).map((d: any) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        description: d.description,
        displayOrder: d.display_order,
        isActive: d.is_active,
      })) as Department[];
    },
  });
};

// Job Titles
export const useJobTitles = () => {
  return useQuery({
    queryKey: ["job-titles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_titles")
        .select(`
          *,
          departments:department_id (*)
        `)
        .order("display_order");

      if (error) throw error;
      
      return (data || []).map((jt: any) => ({
        id: jt.id,
        departmentId: jt.department_id,
        code: jt.code,
        name: jt.name,
        description: jt.description,
        seniorityLevel: jt.seniority_level,
        displayOrder: jt.display_order,
        isActive: jt.is_active,
        department: jt.departments ? {
          id: jt.departments.id,
          code: jt.departments.code,
          name: jt.departments.name,
          description: jt.departments.description,
          displayOrder: jt.departments.display_order,
          isActive: jt.departments.is_active,
        } : undefined,
      })) as JobTitle[];
    },
  });
};

// Features
export const useFeatures = () => {
  return useQuery({
    queryKey: ["features"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .order("display_order");

      if (error) throw error;
      
      return (data || []).map((f: any) => ({
        id: f.id,
        parentId: f.parent_id,
        code: f.code,
        name: f.name,
        description: f.description,
        featureType: f.feature_type,
        iconName: f.icon_name,
        routePath: f.route_path,
        displayOrder: f.display_order,
        isActive: f.is_active,
      })) as Feature[];
    },
  });
};

// Feature Permissions for a job title
export const useFeaturePermissions = (jobTitleId?: string) => {
  return useQuery({
    queryKey: ["feature-permissions", jobTitleId],
    queryFn: async () => {
      if (!jobTitleId) return [];
      
      const { data, error } = await supabase
        .from("feature_permissions")
        .select(`
          *,
          features:feature_id (*)
        `)
        .eq("job_title_id", jobTitleId);

      if (error) throw error;
      
      return (data || []).map((fp: any) => ({
        id: fp.id,
        jobTitleId: fp.job_title_id,
        featureId: fp.feature_id,
        canView: fp.can_view,
        canCreate: fp.can_create,
        canEdit: fp.can_edit,
        canDelete: fp.can_delete,
        canExport: fp.can_export,
        customRules: fp.custom_rules || {},
        feature: fp.features ? {
          id: fp.features.id,
          parentId: fp.features.parent_id,
          code: fp.features.code,
          name: fp.features.name,
          description: fp.features.description,
          featureType: fp.features.feature_type,
          iconName: fp.features.icon_name,
          routePath: fp.features.route_path,
          displayOrder: fp.features.display_order,
          isActive: fp.features.is_active,
        } : undefined,
      })) as FeaturePermission[];
    },
    enabled: !!jobTitleId,
  });
};

// All users with assignments
export const useAllUsers = () => {
  return useQuery({
    queryKey: ["all-users-with-assignments"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (profilesError) throw profilesError;

      const { data: assignments, error: assignmentsError } = await supabase
        .from("user_job_assignments")
        .select(`
          *,
          job_titles:job_title_id (
            *,
            departments:department_id (*)
          )
        `);

      if (assignmentsError) throw assignmentsError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const assignmentMap = new Map(assignments?.map((a: any) => [a.user_id, a]) || []);
      const roleMap = new Map(roles?.map((r: any) => [r.user_id, r.role]) || []);

      return (profiles || []).map((p: any) => {
        const assignment = assignmentMap.get(p.id) as any;
        return {
          id: p.id,
          name: p.name,
          email: p.email,
          profilePictureUrl: p.profile_picture_url,
          createdAt: p.created_at,
          assignment: assignment ? {
            id: assignment.id,
            userType: assignment.user_type,
            jobTitleId: assignment.job_title_id,
            jobTitle: assignment.job_titles ? {
              id: assignment.job_titles.id,
              departmentId: assignment.job_titles.department_id,
              code: assignment.job_titles.code,
              name: assignment.job_titles.name,
              description: assignment.job_titles.description,
              seniorityLevel: assignment.job_titles.seniority_level,
              displayOrder: assignment.job_titles.display_order,
              isActive: assignment.job_titles.is_active,
              department: assignment.job_titles.departments ? {
                id: assignment.job_titles.departments.id,
                code: assignment.job_titles.departments.code,
                name: assignment.job_titles.departments.name,
                description: assignment.job_titles.departments.description,
                displayOrder: assignment.job_titles.departments.display_order,
                isActive: assignment.job_titles.departments.is_active,
              } : undefined,
            } : undefined,
          } : undefined,
          role: roleMap.get(p.id) || null,
        } as UserWithAssignment;
      });
    },
  });
};

// Assign user to job title
export const useAssignUserJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userType,
      jobTitleId,
    }: {
      userId: string;
      userType: 'agency' | 'client' | 'guest';
      jobTitleId?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("user_job_assignments")
        .upsert({
          user_id: userId,
          user_type: userType,
          job_title_id: jobTitleId,
          assigned_by: user?.id,
        }, {
          onConflict: "user_id"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users-with-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["user-assignment"] });
      toast.success("User assignment updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user assignment");
    },
  });
};

// Update feature permission
export const useUpdateFeaturePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobTitleId,
      featureId,
      permissions,
    }: {
      jobTitleId: string;
      featureId: string;
      permissions: {
        canView?: boolean;
        canCreate?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
        canExport?: boolean;
      };
    }) => {
      const { data, error } = await supabase
        .from("feature_permissions")
        .upsert({
          job_title_id: jobTitleId,
          feature_id: featureId,
          can_view: permissions.canView ?? false,
          can_create: permissions.canCreate ?? false,
          can_edit: permissions.canEdit ?? false,
          can_delete: permissions.canDelete ?? false,
          can_export: permissions.canExport ?? false,
        }, {
          onConflict: "job_title_id,feature_id"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-permissions"] });
      toast.success("Permission updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update permission");
    },
  });
};
