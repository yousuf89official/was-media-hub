import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Lightbulb, Palette, Users, DollarSign, Star, Megaphone, Sparkles, Mail, Search, BarChart3 } from "lucide-react";
import { useCampaignServiceCategories, useCampaignServices, useCreateCampaignService, useUpdateCampaignService, useDeleteCampaignService } from "@/hooks/useCampaignServiceCategories";

const iconMap: Record<string, any> = {
  Lightbulb, Palette, Users, DollarSign, Star, Megaphone, Sparkles, Mail, Search, BarChart3
};

export function CampaignServicesTab() {
  const { data: categories, isLoading: loadingCategories } = useCampaignServiceCategories();
  const { data: services, isLoading: loadingServices } = useCampaignServices();
  const createService = useCreateCampaignService();
  const updateService = useUpdateCampaignService();
  const deleteService = useDeleteCampaignService();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getServicesByCategory = (categoryId: string) => {
    return services?.filter(s => s.category_id === categoryId) || [];
  };

  const handleSubmit = async () => {
    if (editingService) {
      await updateService.mutateAsync({ id: editingService.id, ...formData });
    } else {
      await createService.mutateAsync({ category_id: selectedCategoryId, ...formData });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingService(null);
    setSelectedCategoryId("");
  };

  const openAddService = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsDialogOpen(true);
  };

  const openEditService = (service: any) => {
    setEditingService(service);
    setFormData({ name: service.name, description: service.description || "" });
    setIsDialogOpen(true);
  };

  if (loadingCategories || loadingServices) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Campaign Services</h2>
          <p className="text-muted-foreground">Manage service categories and individual services</p>
        </div>
      </div>

      <div className="grid gap-4">
        {categories?.map((category) => {
          const IconComponent = iconMap[category.icon_name || "Settings"] || Lightbulb;
          const categoryServices = getServicesByCategory(category.id);
          const isExpanded = expandedCategories.has(category.id);

          return (
            <Collapsible key={category.id} open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className="text-muted-foreground text-sm font-normal">({category.code})</span>
                            {category.name}
                            <Badge variant="secondary">{categoryServices.length} services</Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">{category.description}</CardDescription>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddService(category.id);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Service
                      </Button>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {categoryServices.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-4 text-center">No services in this category yet.</p>
                    ) : (
                      <div className="grid gap-2">
                        {categoryServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{service.name}</span>
                                <Badge variant={service.is_active ? "default" : "secondary"} className="text-xs">
                                  {service.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              {service.description && (
                                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditService(service)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteId(service.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Service Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Enter service name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Enter service description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>
              {editingService ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteService.mutate(deleteId!); setDeleteId(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
