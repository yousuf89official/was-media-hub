import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGateProps {
  feature: string;
  permission?: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'any';
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGate = ({
  feature,
  permission = 'view',
  children,
  fallback = null,
}: PermissionGateProps) => {
  const { 
    canView, 
    canCreate, 
    canEdit, 
    canDelete, 
    canExport, 
    hasAnyPermission,
    isLoading 
  } = usePermissions();

  if (isLoading) {
    return null;
  }

  let hasPermission = false;

  switch (permission) {
    case 'view':
      hasPermission = canView(feature);
      break;
    case 'create':
      hasPermission = canCreate(feature);
      break;
    case 'edit':
      hasPermission = canEdit(feature);
      break;
    case 'delete':
      hasPermission = canDelete(feature);
      break;
    case 'export':
      hasPermission = canExport(feature);
      break;
    case 'any':
      hasPermission = hasAnyPermission(feature);
      break;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Higher-order component version
export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string,
  permission: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'any' = 'view'
) => {
  return (props: P) => (
    <PermissionGate feature={feature} permission={permission}>
      <WrappedComponent {...props} />
    </PermissionGate>
  );
};
