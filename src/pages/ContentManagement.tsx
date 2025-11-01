import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoManager } from "@/components/admin/LogoManager";
import { HeroSectionEditor } from "@/components/admin/HeroSectionEditor";
import { CTASectionEditor } from "@/components/admin/CTASectionEditor";
import { FooterEditor } from "@/components/admin/FooterEditor";
import { FeatureList } from "@/components/admin/FeatureList";
import { Loader2 } from "lucide-react";

const ContentManagement = () => {
  const { data: userRole, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== "MasterAdmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management System</h1>
        <p className="text-muted-foreground mt-2">
          Manage all frontend content, logos, and landing page elements
        </p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="cta">CTA Section</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Logos</CardTitle>
              <CardDescription>
                Upload and manage logos for different sections of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Edit the main hero section on the landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeroSectionEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Cards</CardTitle>
              <CardDescription>
                Add, edit, or remove feature cards displayed on the landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Call-to-Action Section</CardTitle>
              <CardDescription>
                Edit the call-to-action section on the landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CTASectionEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
              <CardDescription>
                Edit footer text and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FooterEditor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
