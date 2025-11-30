import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Target, Users, Layers, BarChart3, Layout, DollarSign, Eye } from "lucide-react";
import { useCampaignTypes, useCreateCampaignType, useUpdateCampaignType, useDeleteCampaignType } from "@/hooks/useCampaignTypes";
import { useServiceTypes, useCreateServiceType, useUpdateServiceType, useDeleteServiceType } from "@/hooks/useServiceTypes";
import { useChannelCategories, useCreateChannelCategory, useUpdateChannelCategory, useDeleteChannelCategory } from "@/hooks/useChannelCategories";
import { useExtendedChannels, useCreateExtendedChannel, useUpdateExtendedChannel, useDeleteExtendedChannel } from "@/hooks/useExtendedChannels";
import { useMetricDefinitions, useCreateMetricDefinition, useUpdateMetricDefinition, useDeleteMetricDefinition } from "@/hooks/useMetricDefinitions";
import { useExtendedObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from "@/hooks/useExtendedObjectives";
import { useExtendedBuyingModels, useCreateBuyingModel, useUpdateBuyingModel, useDeleteBuyingModel } from "@/hooks/useExtendedBuyingModels";
import { usePlacements, useCreatePlacement, useUpdatePlacement, useDeletePlacement } from "@/hooks/usePlacements";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
        <p className="text-muted-foreground">Configure campaign types, services, channels, objectives, buying models, and metrics</p>
      </div>

      <Tabs defaultValue="campaign-types" className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-6">
          <TabsTrigger value="campaign-types" className="text-xs">Campaign Types</TabsTrigger>
          <TabsTrigger value="service-types" className="text-xs">Services</TabsTrigger>
          <TabsTrigger value="channel-categories" className="text-xs">Categories</TabsTrigger>
          <TabsTrigger value="channels" className="text-xs">Channels</TabsTrigger>
          <TabsTrigger value="objectives" className="text-xs">Objectives</TabsTrigger>
          <TabsTrigger value="buying-models" className="text-xs">Buying Models</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
          <TabsTrigger value="placements" className="text-xs">Placements</TabsTrigger>
        </TabsList>

        <TabsContent value="campaign-types">
          <CampaignTypesTab />
        </TabsContent>

        <TabsContent value="service-types">
          <ServiceTypesTab />
        </TabsContent>

        <TabsContent value="channel-categories">
          <ChannelCategoriesTab />
        </TabsContent>

        <TabsContent value="channels">
          <ChannelsTab />
        </TabsContent>

        <TabsContent value="objectives">
          <ObjectivesTab />
        </TabsContent>

        <TabsContent value="buying-models">
          <BuyingModelsTab />
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsTab />
        </TabsContent>

        <TabsContent value="placements">
          <PlacementsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Campaign Types Tab
function CampaignTypesTab() {
  const { data: campaignTypes, isLoading } = useCampaignTypes();
  const createMutation = useCreateCampaignType();
  const updateMutation = useUpdateCampaignType();
  const deleteMutation = useDeleteCampaignType();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type_enum: "Branding.Brand" as const,
    description: "",
    icon_name: "Target",
    is_active: true
  });

  const handleSubmit = async () => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", type_enum: "Branding.Brand", description: "", icon_name: "Target", is_active: true });
    setEditingItem(null);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type_enum: item.type_enum,
      description: item.description || "",
      icon_name: item.icon_name || "Target",
      is_active: item.is_active
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Campaign Types</CardTitle>
          <CardDescription>Define types of campaigns (Branding, Performance)</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Type</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} Campaign Type</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={formData.type_enum} onValueChange={(v: any) => setFormData({ ...formData, type_enum: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Branding.Brand">Branding - Brand</SelectItem>
                    <SelectItem value="Branding.Category">Branding - Category</SelectItem>
                    <SelectItem value="Branding.Product">Branding - Product</SelectItem>
                    <SelectItem value="Performance.Product">Performance - Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={!formData.name}>{editingItem ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaignTypes?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell><Badge variant="outline">{item.type_enum}</Badge></TableCell>
                <TableCell className="text-muted-foreground max-w-[300px] truncate">{item.description}</TableCell>
                <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign Type?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Service Types Tab
function ServiceTypesTab() {
  const { data: serviceTypes } = useServiceTypes();
  const createMutation = useCreateServiceType();
  const updateMutation = useUpdateServiceType();
  const deleteMutation = useDeleteServiceType();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type_enum: "SocialMediaManagement" as const,
    description: "",
    icon_name: "Settings",
    is_active: true
  });

  const serviceEnums = [
    "SocialMediaManagement", "PaidMediaBuying", "InfluencerMarketing", "KOLManagement",
    "BrandActivation", "ProgrammaticDisplay", "ProgrammaticSocial", "RetailMedia",
    "SEO", "SEM", "CRO", "AnalyticsAndReporting"
  ] as const;

  const handleSubmit = async () => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", type_enum: "SocialMediaManagement", description: "", icon_name: "Settings", is_active: true });
    setEditingItem(null);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ name: item.name, type_enum: item.type_enum, description: item.description || "", icon_name: item.icon_name || "Settings", is_active: item.is_active });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Service Types</CardTitle>
          <CardDescription>Marketing services offered (SMM, Paid Media, KOL, etc.)</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Service</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Service Type</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="grid gap-2">
                <Label>Type Enum</Label>
                <Select value={formData.type_enum} onValueChange={(v: any) => setFormData({ ...formData, type_enum: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {serviceEnums.map(e => <SelectItem key={e} value={e}>{e.replace(/([A-Z])/g, ' $1').trim()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /><Label>Active</Label></div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {serviceTypes?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell><Badge variant="outline">{item.type_enum}</Badge></TableCell>
                <TableCell className="text-muted-foreground max-w-[300px] truncate">{item.description}</TableCell>
                <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Service Type?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Channel Categories Tab
function ChannelCategoriesTab() {
  const { data: categories } = useChannelCategories();
  const createMutation = useCreateChannelCategory();
  const updateMutation = useUpdateChannelCategory();
  const deleteMutation = useDeleteChannelCategory();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", brand_color: "#000000", is_active: true });

  const handleSubmit = async () => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", brand_color: "#000000", is_active: true }); setEditingItem(null); };
  const openEdit = (item: any) => { setEditingItem(item); setFormData({ name: item.name, brand_color: item.brand_color || "#000000", is_active: item.is_active }); setIsDialogOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" /> Channel Categories</CardTitle><CardDescription>Group channels by platform (Meta, Google, TikTok)</CardDescription></div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Category</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Channel Category</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Brand Color</Label><div className="flex gap-2"><Input type="color" value={formData.brand_color} onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })} className="w-16 h-10" /><Input value={formData.brand_color} onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })} /></div></div>
              <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /><Label>Active</Label></div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Brand Color</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {categories?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell><div className="flex items-center gap-2"><div className="w-6 h-6 rounded border" style={{ backgroundColor: item.brand_color || '#ccc' }} /><span className="text-muted-foreground">{item.brand_color}</span></div></TableCell>
                <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Category?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Channels Tab
function ChannelsTab() {
  const { data: channels } = useExtendedChannels();
  const { data: categories } = useChannelCategories();
  const createMutation = useCreateExtendedChannel();
  const updateMutation = useUpdateExtendedChannel();
  const deleteMutation = useDeleteExtendedChannel();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", channel_type: "Social" as const, channel_category_id: "", brand_color: "#000000" });

  const channelTypes = ["Social", "Programmatic", "Display", "PR", "Email", "Owned"] as const;

  const handleSubmit = async () => {
    const payload = { ...formData, channel_category_id: formData.channel_category_id || undefined };
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", channel_type: "Social", channel_category_id: "", brand_color: "#000000" }); setEditingItem(null); };
  const openEdit = (item: any) => { setEditingItem(item); setFormData({ name: item.name, channel_type: item.channel_type, channel_category_id: item.channel_category_id || "", brand_color: item.brand_color || "#000000" }); setIsDialogOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5" /> Channels</CardTitle><CardDescription>Marketing channels (Instagram, TikTok, YouTube)</CardDescription></div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Channel</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Channel</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="grid gap-2">
                <Label>Channel Type</Label>
                <Select value={formData.channel_type} onValueChange={(v: any) => setFormData({ ...formData, channel_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{channelTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={formData.channel_category_id} onValueChange={(v) => setFormData({ ...formData, channel_category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Brand Color</Label><div className="flex gap-2"><Input type="color" value={formData.brand_color} onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })} className="w-16 h-10" /><Input value={formData.brand_color} onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })} /></div></div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Category</TableHead><TableHead>Color</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {channels?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell><Badge variant="outline">{item.channel_type}</Badge></TableCell>
                <TableCell>{item.channel_category?.name || "-"}</TableCell>
                <TableCell><div className="w-6 h-6 rounded border" style={{ backgroundColor: item.brand_color || item.channel_category?.brand_color || '#ccc' }} /></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Channel?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Objectives Tab
function ObjectivesTab() {
  const { data: objectives } = useExtendedObjectives();
  const { data: channels } = useExtendedChannels();
  const createMutation = useCreateObjective();
  const updateMutation = useUpdateObjective();
  const deleteMutation = useDeleteObjective();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", channel_id: "", funnel_type: "TOP" as const });

  const funnelTypes = ["TOP", "MID", "BOTTOM"] as const;

  const handleSubmit = async () => {
    const payload = { ...formData, channel_id: formData.channel_id || undefined, funnel_type: formData.funnel_type };
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", description: "", channel_id: "", funnel_type: "TOP" }); setEditingItem(null); };
  const openEdit = (item: any) => { setEditingItem(item); setFormData({ name: item.name, description: item.description || "", channel_id: item.channel_id || "", funnel_type: item.funnel_type || "TOP" }); setIsDialogOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Objectives</CardTitle><CardDescription>Campaign objectives (Awareness, Traffic, Conversion)</CardDescription></div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Objective</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Objective</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="grid gap-2">
                <Label>Funnel Stage</Label>
                <Select value={formData.funnel_type} onValueChange={(v: any) => setFormData({ ...formData, funnel_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{funnelTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Channel (Optional)</Label>
                <Select value={formData.channel_id} onValueChange={(v) => setFormData({ ...formData, channel_id: v })}>
                  <SelectTrigger><SelectValue placeholder="All channels" /></SelectTrigger>
                  <SelectContent><SelectItem value="">All Channels</SelectItem>{channels?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Funnel</TableHead><TableHead>Channel</TableHead><TableHead>Description</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {objectives?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell><Badge variant={item.funnel_type === 'TOP' ? 'default' : item.funnel_type === 'MID' ? 'secondary' : 'outline'}>{item.funnel_type}</Badge></TableCell>
                <TableCell>{item.channel?.name || "All"}</TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">{item.description}</TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Objective?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Buying Models Tab
function BuyingModelsTab() {
  const { data: buyingModels } = useExtendedBuyingModels();
  const { data: channels } = useExtendedChannels();
  const { data: objectives } = useExtendedObjectives();
  const createMutation = useCreateBuyingModel();
  const updateMutation = useUpdateBuyingModel();
  const deleteMutation = useDeleteBuyingModel();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", channel_id: "", objective_id: "" });

  const handleSubmit = async () => {
    const payload = { ...formData, channel_id: formData.channel_id || undefined, objective_id: formData.objective_id || undefined };
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", description: "", channel_id: "", objective_id: "" }); setEditingItem(null); };
  const openEdit = (item: any) => { setEditingItem(item); setFormData({ name: item.name, description: item.description || "", channel_id: item.channel_id || "", objective_id: item.objective_id || "" }); setIsDialogOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Buying Models</CardTitle><CardDescription>Pricing models (CPM, CPC, CPA, etc.)</CardDescription></div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Buying Model</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Buying Model</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="grid gap-2">
                <Label>Channel (Optional)</Label>
                <Select value={formData.channel_id} onValueChange={(v) => setFormData({ ...formData, channel_id: v })}>
                  <SelectTrigger><SelectValue placeholder="All channels" /></SelectTrigger>
                  <SelectContent><SelectItem value="">All Channels</SelectItem>{channels?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Objective (Optional)</Label>
                <Select value={formData.objective_id} onValueChange={(v) => setFormData({ ...formData, objective_id: v })}>
                  <SelectTrigger><SelectValue placeholder="All objectives" /></SelectTrigger>
                  <SelectContent><SelectItem value="">All Objectives</SelectItem>{objectives?.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Channel</TableHead><TableHead>Objective</TableHead><TableHead>Description</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {buyingModels?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.channel?.name || "All"}</TableCell>
                <TableCell>{item.objective?.name || "All"}</TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">{item.description}</TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Buying Model?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Metrics Tab
function MetricsTab() {
  const { data: metrics } = useMetricDefinitions();
  const createMutation = useCreateMetricDefinition();
  const updateMutation = useUpdateMetricDefinition();
  const deleteMutation = useDeleteMetricDefinition();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", key: "", category: "awareness", description: "", data_type: "number", is_active: true });

  const categories = ["awareness", "engagement", "conversion", "financial"];
  const dataTypes = ["number", "currency", "percentage", "ratio"];

  const handleSubmit = async () => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", key: "", category: "awareness", description: "", data_type: "number", is_active: true }); setEditingItem(null); };
  const openEdit = (item: any) => { setEditingItem(item); setFormData({ name: item.name, key: item.key, category: item.category, description: item.description || "", data_type: item.data_type, is_active: item.is_active }); setIsDialogOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Metric Definitions</CardTitle><CardDescription>Available metrics for tracking performance</CardDescription></div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Metric</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Metric</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Key (snake_case)</Label><Input value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })} disabled={!!editingItem} /></div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Data Type</Label>
                <Select value={formData.data_type} onValueChange={(v) => setFormData({ ...formData, data_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{dataTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /><Label>Active</Label></div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name || !formData.key}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Key</TableHead><TableHead>Category</TableHead><TableHead>Type</TableHead><TableHead>System</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {metrics?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{item.key}</code></TableCell>
                <TableCell className="capitalize">{item.category}</TableCell>
                <TableCell className="capitalize">{item.data_type}</TableCell>
                <TableCell>{item.is_system ? <Badge variant="secondary">System</Badge> : <Badge variant="outline">Custom</Badge>}</TableCell>
                <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>{!item.is_system && <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Metric?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Placements Tab
function PlacementsTab() {
  const { data: placements } = usePlacements();
  const { data: channels } = useExtendedChannels();
  const createMutation = useCreatePlacement();
  const updateMutation = useUpdatePlacement();
  const deleteMutation = useDeletePlacement();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", channel_id: "", mock_type: "MobileFeedMock" as const, aspect_ratio: "1:1", is_active: true });

  const mockTypes = ["MobileFeedMock", "StoryMock", "ReelsMock", "InStreamMock", "BillboardMock", "SearchAdMock", "DisplayAdMock"] as const;
  const aspectRatios = ["1:1", "4:5", "9:16", "16:9", "4:3"];

  const handleSubmit = async () => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", channel_id: "", mock_type: "MobileFeedMock", aspect_ratio: "1:1", is_active: true }); setEditingItem(null); };
  const openEdit = (item: any) => { setEditingItem(item); setFormData({ name: item.name, channel_id: item.channel_id, mock_type: item.mock_type, aspect_ratio: item.aspect_ratio || "1:1", is_active: item.is_active }); setIsDialogOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Placements</CardTitle><CardDescription>Ad placements within channels (Feed, Stories, Reels)</CardDescription></div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Placement</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Placement</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="grid gap-2">
                <Label>Channel</Label>
                <Select value={formData.channel_id} onValueChange={(v) => setFormData({ ...formData, channel_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger>
                  <SelectContent>{channels?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Mock Type</Label>
                <Select value={formData.mock_type} onValueChange={(v: any) => setFormData({ ...formData, mock_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{mockTypes.map(t => <SelectItem key={t} value={t}>{t.replace('Mock', '')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Aspect Ratio</Label>
                <Select value={formData.aspect_ratio} onValueChange={(v) => setFormData({ ...formData, aspect_ratio: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{aspectRatios.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /><Label>Active</Label></div>
            </div>
            <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name || !formData.channel_id}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Channel</TableHead><TableHead>Mock Type</TableHead><TableHead>Aspect Ratio</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {placements?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.channel?.name || "-"}</TableCell>
                <TableCell><Badge variant="outline">{item.mock_type.replace('Mock', '')}</Badge></TableCell>
                <TableCell>{item.aspect_ratio}</TableCell>
                <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Placement?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteMutation.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
