import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Briefcase, Shield, Key } from "lucide-react";
import { UserDirectory } from "@/components/admin/UserDirectory";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import { BrandAccessManager } from "@/components/admin/BrandAccessManager";
import { DepartmentManager } from "@/components/admin/DepartmentManager";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, permissions, and brand access across the organization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="brand-access" className="gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Brand Access</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Directory
              </CardTitle>
              <CardDescription>
                View and manage all users, assign job titles and user types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserDirectory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Structure
              </CardTitle>
              <CardDescription>
                View departments and job titles in the organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permission Matrix
              </CardTitle>
              <CardDescription>
                Configure feature permissions for each job title
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionMatrix />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand-access" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Brand Access Control
              </CardTitle>
              <CardDescription>
                Manage client access to specific brands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandAccessManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
