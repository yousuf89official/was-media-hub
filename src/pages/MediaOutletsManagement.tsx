import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import {
  useAllMediaOutlets,
  useAddMediaOutlet,
  useUpdateMediaOutlet,
  useDeleteMediaOutlet,
} from "@/hooks/useMediaOutlets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Newspaper } from "lucide-react";
import { toast } from "sonner";

const MediaOutletsManagement = () => {
  const navigate = useNavigate();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const { data: outlets, isLoading } = useAllMediaOutlets();
  const addOutlet = useAddMediaOutlet();
  const updateOutlet = useUpdateMediaOutlet();
  const deleteOutlet = useDeleteMediaOutlet();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    tier: 1,
    average_monthly_visits: 0,
    average_page_views_per_article: 0,
    ecpm: 0,
  });

  // Redirect if not MasterAdmin
  if (!roleLoading && userRole !== "MasterAdmin") {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.ecpm <= 0) {
      toast.error("Please fill in all fields with valid values");
      return;
    }

    if (editingOutlet) {
      await updateOutlet.mutateAsync({
        id: editingOutlet.id,
        updates: formData,
      });
    } else {
      await addOutlet.mutateAsync({
        ...formData,
        is_active: true,
      });
    }

    setIsDialogOpen(false);
    setEditingOutlet(null);
    setFormData({ 
      name: "", 
      tier: 1, 
      average_monthly_visits: 0,
      average_page_views_per_article: 0,
      ecpm: 0 
    });
  };

  const handleEdit = (outlet: any) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      tier: outlet.tier,
      average_monthly_visits: outlet.average_monthly_visits,
      average_page_views_per_article: outlet.average_page_views_per_article,
      ecpm: outlet.ecpm,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to deactivate this media outlet?")) {
      await deleteOutlet.mutateAsync(id);
    }
  };

  const groupedOutlets = outlets?.reduce((acc, outlet) => {
    const tier = `Tier ${outlet.tier}`;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(outlet);
    return acc;
  }, {} as Record<string, any[]>);

  if (roleLoading || isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Media Outlets Management
              </CardTitle>
              <CardDescription>
                Manage media outlets for PR Value calculations
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingOutlet(null);
                  setFormData({ 
                    name: "", 
                    tier: 1, 
                    average_monthly_visits: 0,
                    average_page_views_per_article: 0,
                    ecpm: 0 
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Media Outlet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingOutlet ? "Edit Media Outlet" : "Add New Media Outlet"}
                    </DialogTitle>
                    <DialogDescription>
                      Configure media outlet details and PR calculation parameters
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Media Outlet Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter media outlet name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tier">Tier</Label>
                      <Select
                        value={formData.tier.toString()}
                        onValueChange={(value) => setFormData({ ...formData, tier: parseInt(value) })}
                      >
                        <SelectTrigger id="tier">
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Tier 1</SelectItem>
                          <SelectItem value="2">Tier 2</SelectItem>
                          <SelectItem value="3">Tier 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="avg_visits">Average Monthly Visits</Label>
                      <Input
                        id="avg_visits"
                        type="number"
                        value={formData.average_monthly_visits}
                        onChange={(e) => setFormData({ ...formData, average_monthly_visits: parseInt(e.target.value) || 0 })}
                        placeholder="Enter average monthly visits"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="avg_pageviews">Average Page Views per Article</Label>
                      <Input
                        id="avg_pageviews"
                        type="number"
                        value={formData.average_page_views_per_article}
                        onChange={(e) => setFormData({ ...formData, average_page_views_per_article: parseInt(e.target.value) || 0 })}
                        placeholder="Enter average page views"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="ecpm">eCPM (IDR)</Label>
                      <Input
                        id="ecpm"
                        type="number"
                        value={formData.ecpm}
                        onChange={(e) => setFormData({ ...formData, ecpm: parseFloat(e.target.value) || 0 })}
                        placeholder="Enter eCPM"
                        required
                      />
                    </div>

                    <div className="p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Estimated AVE per Article:</p>
                      <p className="text-lg font-bold">
                        IDR {(formData.average_page_views_per_article * formData.ecpm).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Formula: Average Page Views × eCPM
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingOutlet(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingOutlet ? "Update" : "Add"} Media Outlet
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {groupedOutlets && Object.keys(groupedOutlets).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedOutlets)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([tier, tierOutlets]) => (
                  <div key={tier}>
                    <h3 className="text-lg font-semibold mb-3">{tier}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Media Outlet</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Avg Monthly Visits</TableHead>
                          <TableHead>Avg Page Views/Article</TableHead>
                          <TableHead>eCPM (IDR)</TableHead>
                          <TableHead>Estimated AVE (IDR)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tierOutlets.map((outlet) => (
                          <TableRow key={outlet.id}>
                            <TableCell className="font-medium">{outlet.name}</TableCell>
                            <TableCell>Tier {outlet.tier}</TableCell>
                            <TableCell>
                              {outlet.average_monthly_visits.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell>
                              {outlet.average_page_views_per_article.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell>
                              IDR {outlet.ecpm.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="font-semibold">
                              IDR {(outlet.average_page_views_per_article * outlet.ecpm).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={outlet.is_active ? "default" : "secondary"}>
                                {outlet.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(outlet)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(outlet.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No media outlets configured yet. Add your first media outlet to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaOutletsManagement;
