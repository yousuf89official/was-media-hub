import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "./ImageUploader";
import { useSiteImages, useDeleteImage } from "@/hooks/useSiteImages";
import { Trash2 } from "lucide-react";

export const LogoManager = () => {
  const { data: images = [], refetch } = useSiteImages();
  const deleteMutation = useDeleteImage();

  const sidebarLogo = images.find((img) => img.name === "sidebar_logo");
  const footerLogo = images.find((img) => img.name === "footer_logo");
  const headerLogo = images.find((img) => img.name === "header_logo");

  const handleDelete = (id: string, storagePath: string) => {
    if (confirm("Are you sure you want to delete this logo?")) {
      deleteMutation.mutate({ id, storagePath }, { onSuccess: () => refetch() });
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Header Logo</CardTitle>
        </CardHeader>
        <CardContent>
          {headerLogo ? (
            <div className="space-y-4">
              <img
                src={headerLogo.url}
                alt={headerLogo.alt_text || "Header logo"}
                className="max-w-xs h-auto border rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(headerLogo.id, headerLogo.storage_path)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Logo
              </Button>
            </div>
          ) : (
            <ImageUploader
              name="header_logo"
              usageLocation="header"
              onSuccess={refetch}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sidebar Logo</CardTitle>
        </CardHeader>
        <CardContent>
          {sidebarLogo ? (
            <div className="space-y-4">
              <img
                src={sidebarLogo.url}
                alt={sidebarLogo.alt_text || "Sidebar logo"}
                className="max-w-xs h-auto border rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(sidebarLogo.id, sidebarLogo.storage_path)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Logo
              </Button>
            </div>
          ) : (
            <ImageUploader
              name="sidebar_logo"
              usageLocation="sidebar"
              onSuccess={refetch}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer Logo</CardTitle>
        </CardHeader>
        <CardContent>
          {footerLogo ? (
            <div className="space-y-4">
              <img
                src={footerLogo.url}
                alt={footerLogo.alt_text || "Footer logo"}
                className="max-w-xs h-auto border rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(footerLogo.id, footerLogo.storage_path)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Logo
              </Button>
            </div>
          ) : (
            <ImageUploader
              name="footer_logo"
              usageLocation="footer"
              onSuccess={refetch}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
