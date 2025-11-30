import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Layers } from "lucide-react";
import { CampaignServicesTab } from "@/components/admin/CampaignServicesTab";
import { PlatformChannelsTab } from "@/components/admin/PlatformChannelsTab";

export default function BrandCampaignManagement() {
  const navigate = useNavigate();
  const { data: userRole, isLoading } = useUserRole();

  useEffect(() => {
    if (!isLoading && userRole !== "MasterAdmin") {
      navigate("/dashboard");
    }
  }, [userRole, isLoading, navigate]);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (userRole !== "MasterAdmin") {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Brand & Campaign Management</h1>
        <p className="text-muted-foreground">Configure campaign services, platforms, channels, and AVE settings</p>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md">
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Campaign Services
          </TabsTrigger>
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Platform & Channels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <CampaignServicesTab />
        </TabsContent>

        <TabsContent value="platforms">
          <PlatformChannelsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
