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
    pr_value_per_article: 0,
  });

  // Redirect if not MasterAdmin
  if (!roleLoading && userRole !== "MasterAdmin") {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.pr_value_per_article <= 0) {
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
    setFormData({ name: "", tier: 1, pr_value_per_article: 0 });
  };

  const handleEdit = (outlet: any) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      tier: outlet.tier,
      pr_value_per_article: outlet.pr_value_per_article,
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
                  setFormData({ name: "", tier: 1, pr_value_per_article: 0 });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Media Outlet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingOutlet ? "Edit Media Outlet" : "Add New Media Outlet"}
                  </DialogTitle>
                  <DialogDescription>
                    Enter the details for the media outlet
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Media Outlet Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Medcom.id"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tier">Tier</Label>
                      <Select
                        value={formData.tier.toString()}
                        onValueChange={(value) => setFormData({ ...formData, tier: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Tier 1</SelectItem>
                          <SelectItem value="2">Tier 2</SelectItem>
                          <SelectItem value="3">Tier 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pr_value">PR Value per Article (IDR)</Label>
                      <Input
                        id="pr_value"
                        type="number"
                        value={formData.pr_value_per_article}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          pr_value_per_article: parseFloat(e.target.value) 
                        })}
                        placeholder="8000000"
                      />
                    </div>
                  </div>
                  <DialogFooter>
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
          {groupedOutlets && Object.entries(groupedOutlets).map(([tier, outlets]) => (
            <div key={tier} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{tier}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Media Outlet</TableHead>
                    <TableHead>PR Value per Article</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outlets.map((outlet) => (
                    <TableRow key={outlet.id}>
                      <TableCell className="font-medium">{outlet.name}</TableCell>
                      <TableCell>
                        IDR {outlet.pr_value_per_article.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          outlet.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {outlet.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(outlet)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {outlet.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(outlet.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaOutletsManagement;
