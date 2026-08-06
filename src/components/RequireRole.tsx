import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface RequireRoleProps {
  /** Roles allowed to render the guarded content. */
  allowed: string[];
  /** Where to send users that do not hold an allowed role. */
  redirectTo?: string;
  children?: ReactNode;
}

/**
 * Route guard that prevents guarded components from mounting at all until the
 * server-verified role is known. Backend RLS remains the source of truth; this
 * only removes the brief render of admin UI for unauthorized users.
 */
export const RequireRole = ({
  allowed,
  redirectTo = "/dashboard",
  children,
}: RequireRoleProps) => {
  const { data: userRole, isLoading } = useUserRole();

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading...</div>;
  }

  if (!userRole || !allowed.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};

export default RequireRole;
