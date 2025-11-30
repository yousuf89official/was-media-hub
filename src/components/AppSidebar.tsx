import { Home, Package, TrendingUp, History, User, FileText, Layout, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Brands", url: "/brands", icon: Package },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "AVE Calculator", url: "/ave-calculator", icon: TrendingUp },
  { title: "Calculation Logs", url: "/calculation-logs", icon: History },
  { title: "Profile", url: "/profile", icon: User },
];

const adminMenuItems = [
  { title: "Brand & Campaigns", url: "/brand-campaign-management", icon: Package },
  { title: "Content Management", url: "/content-management", icon: Layout },
  { title: "User Management", url: "/user-management", icon: Users },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { data: userRole } = useUserRole();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground font-bold">
            {open && "WAS Media Hub"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "!text-sidebar-foreground hover:bg-primary hover:text-primary-foreground"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {userRole === "MasterAdmin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-foreground font-bold">
              {open && "Administration"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "!text-sidebar-foreground hover:bg-primary hover:text-primary-foreground"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
