import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Layers, Target, DollarSign, BarChart3, Layout, Newspaper, Settings } from "lucide-react";
import { useChannelCategories, useCreateChannelCategory, useUpdateChannelCategory, useDeleteChannelCategory } from "@/hooks/useChannelCategories";
import { useExtendedChannels, useCreateExtendedChannel, useUpdateExtendedChannel, useDeleteExtendedChannel } from "@/hooks/useExtendedChannels";
import { useExtendedObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from "@/hooks/useExtendedObjectives";
import { useExtendedBuyingModels, useCreateBuyingModel, useUpdateBuyingModel, useDeleteBuyingModel } from "@/hooks/useExtendedBuyingModels";
import { useMetricDefinitions, useCreateMetricDefinition, useUpdateMetricDefinition, useDeleteMetricDefinition } from "@/hooks/useMetricDefinitions";
import { usePlacements, useCreatePlacement, useUpdatePlacement, useDeletePlacement } from "@/hooks/usePlacements";
import { useAllMediaOutlets, useAddMediaOutlet, useUpdateMediaOutlet, useDeleteMediaOutlet } from "@/hooks/useMediaOutlets";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PRSettingsEditor } from "./PRSettingsEditor";

type SubTab = "platforms" | "objectives" | "buying-models" | "metrics" | "placements" | "ave-settings" | "media-outlets";

export function PlatformChannelsTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("platforms");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Platform & Channels</h2>
          <p className="text-muted-foreground">Manage platforms, channels, objectives, buying models, metrics, placements, and AVE settings</p>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as SubTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="platforms" className="text-xs"><Layers className="h-3 w-3 mr-1" /> Platforms</TabsTrigger>
          <TabsTrigger value="objectives" className="text-xs"><Target className="h-3 w-3 mr-1" /> Objectives</TabsTrigger>
          <TabsTrigger value="buying-models" className="text-xs"><DollarSign className="h-3 w-3 mr-1" /> Buying</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs"><BarChart3 className="h-3 w-3 mr-1" /> Metrics</TabsTrigger>
          <TabsTrigger value="placements" className="text-xs"><Layout className="h-3 w-3 mr-1" /> Placements</TabsTrigger>
          <TabsTrigger value="ave-settings" className="text-xs"><Settings className="h-3 w-3 mr-1" /> AVE Settings</TabsTrigger>
          <TabsTrigger value="media-outlets" className="text-xs"><Newspaper className="h-3 w-3 mr-1" /> Media Outlets</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="mt-4">
          <PlatformsSection />
        </TabsContent>

        <TabsContent value="objectives" className="mt-4">
          <ObjectivesSection />
        </TabsContent>

        <TabsContent value="buying-models" className="mt-4">
          <BuyingModelsSection />
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <MetricsSection />
        </TabsContent>

        <TabsContent value="placements" className="mt-4">
          <PlacementsSection />
        </TabsContent>

        <TabsContent value="ave-settings" className="mt-4">
          <AVESettingsSection />
        </TabsContent>

        <TabsContent value="media-outlets" className="mt-4">
          <MediaOutletsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Platforms & Channels Section
function PlatformsSection() {
  const { data: categories } = useChannelCategories();
  const { data: channels } = useExtendedChannels();
  const createCategory = useCreateChannelCategory();
  const updateCategory = useUpdateChannelCategory();
  const deleteCategory = useDeleteChannelCategory();
  const createChannel = useCreateExtendedChannel();
  const updateChannel = useUpdateExtendedChannel();
  const deleteChannel = useDeleteExtendedChannel();

  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [dialogType, setDialogType] = useState<"category" | "channel" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "channel"; id: string } | null>(null);
  
  const [categoryForm, setCategoryForm] = useState({ name: "", brand_color: "#3b82f6", is_active: true });
  const [channelForm, setChannelForm] = useState({ 
    name: "", 
    channel_type: "Social" as const, 
    channel_category_id: "", 
    brand_color: "#3b82f6", 
    display_order: 0 
  });

  const channelTypes = ["Social", "Programmatic", "Display", "PR", "Email", "Owned"] as const;

  const togglePlatform = (platformId: string) => {
    setExpandedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platformId)) next.delete(platformId);
      else next.add(platformId);
      return next;
    });
  };

  const getChannelsByCategory = (categoryId: string) => {
    return channels?.filter(c => c.channel_category_id === categoryId) || [];
  };

  const handleSubmitCategory = async () => {
    if (editingItem) {
      await updateCategory.mutateAsync({ id: editingItem.id, ...categoryForm });
    } else {
      await createCategory.mutateAsync(categoryForm);
    }
    setDialogType(null);
    resetForms();
  };

  const handleSubmitChannel = async () => {
    if (editingItem) {
      await updateChannel.mutateAsync({ id: editingItem.id, ...channelForm });
    } else {
      await createChannel.mutateAsync({ ...channelForm, channel_category_id: selectedCategoryId || channelForm.channel_category_id });
    }
    setDialogType(null);
    resetForms();
  };

  const resetForms = () => {
    setCategoryForm({ name: "", brand_color: "#3b82f6", is_active: true });
    setChannelForm({ name: "", channel_type: "Social", channel_category_id: "", brand_color: "#3b82f6", display_order: 0 });
    setEditingItem(null);
    setSelectedCategoryId("");
  };

  const openEditCategory = (item: any) => {
    setEditingItem(item);
    setCategoryForm({ name: item.name, brand_color: item.brand_color || "#3b82f6", is_active: item.is_active });
    setDialogType("category");
  };

  const openEditChannel = (item: any) => {
    setEditingItem(item);
    setChannelForm({
      name: item.name,
      channel_type: item.channel_type,
      channel_category_id: item.channel_category_id || "",
      brand_color: item.brand_color || "#3b82f6",
      display_order: item.display_order || 0
    });
    setDialogType("channel");
  };

  const openAddChannel = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setChannelForm(prev => ({ ...prev, channel_category_id: categoryId }));
    setDialogType("channel");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogType("category")}>
          <Plus className="h-4 w-4 mr-2" /> Add Platform
        </Button>
      </div>

      <div className="grid gap-4">
        {categories?.map((category) => {
          const categoryChannels = getChannelsByCategory(category.id);
          const isExpanded = expandedPlatforms.has(category.id);

          return (
            <Collapsible key={category.id} open={isExpanded} onOpenChange={() => togglePlatform(category.id)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.brand_color || "#3b82f6" }} 
                        />
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {category.name}
                            <Badge variant="secondary">{categoryChannels.length} channels</Badge>
                            <Badge variant={category.is_active ? "default" : "outline"}>
                              {category.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => openAddChannel(category.id)}>
                          <Plus className="h-4 w-4 mr-1" /> Channel
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEditCategory(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteTarget({ type: "category", id: category.id })}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {categoryChannels.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-4 text-center">No channels in this platform.</p>
                    ) : (
                      <div className="grid gap-2">
                        {categoryChannels.map((channel) => (
                          <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.brand_color || "#666" }} />
                              <div>
                                <span className="font-medium">{channel.name}</span>
                                <Badge variant="outline" className="ml-2 text-xs">{channel.channel_type}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditChannel(channel)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: "channel", id: channel.id })}>
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

      {/* Category Dialog */}
      <Dialog open={dialogType === "category"} onOpenChange={(open) => { if (!open) { setDialogType(null); resetForms(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Platform" : "Add Platform"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Platform Name</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Brand Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={categoryForm.brand_color} onChange={(e) => setCategoryForm({ ...categoryForm, brand_color: e.target.value })} className="w-16 h-10" />
                <Input value={categoryForm.brand_color} onChange={(e) => setCategoryForm({ ...categoryForm, brand_color: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={categoryForm.is_active} onCheckedChange={(v) => setCategoryForm({ ...categoryForm, is_active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>Cancel</Button>
            <Button onClick={handleSubmitCategory} disabled={!categoryForm.name}>{editingItem ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Channel Dialog */}
      <Dialog open={dialogType === "channel"} onOpenChange={(open) => { if (!open) { setDialogType(null); resetForms(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Channel" : "Add Channel"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Channel Name</Label>
              <Input value={channelForm.name} onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Channel Type</Label>
              <Select value={channelForm.channel_type} onValueChange={(v: any) => setChannelForm({ ...channelForm, channel_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channelTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!selectedCategoryId && (
              <div className="grid gap-2">
                <Label>Platform</Label>
                <Select value={channelForm.channel_category_id} onValueChange={(v) => setChannelForm({ ...channelForm, channel_category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Brand Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={channelForm.brand_color} onChange={(e) => setChannelForm({ ...channelForm, brand_color: e.target.value })} className="w-16 h-10" />
                <Input value={channelForm.brand_color} onChange={(e) => setChannelForm({ ...channelForm, brand_color: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Display Order</Label>
              <Input type="number" value={channelForm.display_order} onChange={(e) => setChannelForm({ ...channelForm, display_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>Cancel</Button>
            <Button onClick={handleSubmitChannel} disabled={!channelForm.name}>{editingItem ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type === "category" ? "Platform" : "Channel"}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteTarget?.type === "category") deleteCategory.mutate(deleteTarget.id);
              else if (deleteTarget?.type === "channel") deleteChannel.mutate(deleteTarget.id);
              setDeleteTarget(null);
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Objectives Section
function ObjectivesSection() {
  const { data: objectives } = useExtendedObjectives();
  const { data: channels } = useExtendedChannels();
  const createObjective = useCreateObjective();
  const updateObjective = useUpdateObjective();
  const deleteObjective = useDeleteObjective();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", channel_id: "", funnel_type: "" as any });

  const handleSubmit = async () => {
    const payload = { ...formData, channel_id: formData.channel_id || null, funnel_type: formData.funnel_type || null };
    if (editingItem) {
      await updateObjective.mutateAsync({ id: editingItem.id, ...payload });
    } else {
      await createObjective.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", channel_id: "", funnel_type: "" });
    setEditingItem(null);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description || "", channel_id: item.channel_id || "", funnel_type: item.funnel_type || "" });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Objectives</CardTitle>
          <CardDescription>Campaign objectives per channel</CardDescription>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Objective</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Funnel</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {objectives?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.channel?.name || "All"}</TableCell>
                <TableCell><Badge variant="outline">{item.funnel_type || "Any"}</Badge></TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">{item.description}</TableCell>
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Objective</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2">
              <Label>Channel (Optional)</Label>
              <Select value={formData.channel_id} onValueChange={(v) => setFormData({ ...formData, channel_id: v })}>
                <SelectTrigger><SelectValue placeholder="All channels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Channels</SelectItem>
                  {channels?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Funnel Type</Label>
              <Select value={formData.funnel_type} onValueChange={(v: any) => setFormData({ ...formData, funnel_type: v })}>
                <SelectTrigger><SelectValue placeholder="Any funnel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="TOP">Top (Awareness)</SelectItem>
                  <SelectItem value="MID">Mid (Consideration)</SelectItem>
                  <SelectItem value="BOTTOM">Bottom (Conversion)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Objective?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteObjective.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Buying Models Section
function BuyingModelsSection() {
  const { data: buyingModels } = useExtendedBuyingModels();
  const { data: channels } = useExtendedChannels();
  const { data: objectives } = useExtendedObjectives();
  const createBuyingModel = useCreateBuyingModel();
  const updateBuyingModel = useUpdateBuyingModel();
  const deleteBuyingModel = useDeleteBuyingModel();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", channel_id: "", objective_id: "" });

  const handleSubmit = async () => {
    const payload = { ...formData, channel_id: formData.channel_id || null, objective_id: formData.objective_id || null };
    if (editingItem) {
      await updateBuyingModel.mutateAsync({ id: editingItem.id, ...payload });
    } else {
      await createBuyingModel.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", description: "", channel_id: "", objective_id: "" }); setEditingItem(null); };
  const openEdit = (item: any) => { setEditingItem(item); setFormData({ name: item.name, description: item.description || "", channel_id: item.channel_id || "", objective_id: item.objective_id || "" }); setIsDialogOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Buying Models</CardTitle><CardDescription>Pricing models per channel/objective</CardDescription></div>
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Model</Button>
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Buying Model</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2">
              <Label>Channel (Optional)</Label>
              <Select value={formData.channel_id} onValueChange={(v) => setFormData({ ...formData, channel_id: v })}><SelectTrigger><SelectValue placeholder="All channels" /></SelectTrigger><SelectContent><SelectItem value="">All</SelectItem>{channels?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid gap-2">
              <Label>Objective (Optional)</Label>
              <Select value={formData.objective_id} onValueChange={(v) => setFormData({ ...formData, objective_id: v })}><SelectTrigger><SelectValue placeholder="All objectives" /></SelectTrigger><SelectContent><SelectItem value="">All</SelectItem>{objectives?.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Buying Model?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteBuyingModel.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Metrics Section
function MetricsSection() {
  const { data: metrics } = useMetricDefinitions();
  const createMetric = useCreateMetricDefinition();
  const updateMetric = useUpdateMetricDefinition();
  const deleteMetric = useDeleteMetricDefinition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", key: "", category: "engagement", description: "", data_type: "number", aggregation_method: "sum", is_active: true });

  const handleSubmit = async () => {
    if (editingItem) {
      await updateMetric.mutateAsync({ id: editingItem.id, ...formData });
    } else {
      await createMetric.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", key: "", category: "engagement", description: "", data_type: "number", aggregation_method: "sum", is_active: true }); setEditingItem(null); };
  const openEdit = (item: any) => { setEditingItem(item); setFormData({ name: item.name, key: item.key, category: item.category, description: item.description || "", data_type: item.data_type || "number", aggregation_method: item.aggregation_method || "sum", is_active: item.is_active }); setIsDialogOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Metric Definitions</CardTitle><CardDescription>Available metrics for tracking</CardDescription></div>
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Metric</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Key</TableHead><TableHead>Category</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {metrics?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell><code className="text-xs bg-muted px-1 rounded">{item.key}</code></TableCell>
                <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                <TableCell>{item.data_type}</TableCell>
                <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Metric</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Key</Label><Input value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} placeholder="e.g., impressions" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="engagement">Engagement</SelectItem><SelectItem value="reach">Reach</SelectItem><SelectItem value="conversion">Conversion</SelectItem><SelectItem value="revenue">Revenue</SelectItem><SelectItem value="cost">Cost</SelectItem></SelectContent></Select>
              </div>
              <div className="grid gap-2">
                <Label>Data Type</Label>
                <Select value={formData.data_type} onValueChange={(v) => setFormData({ ...formData, data_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="number">Number</SelectItem><SelectItem value="currency">Currency</SelectItem><SelectItem value="percentage">Percentage</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /><Label>Active</Label></div>
          </div>
          <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name || !formData.key}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Metric?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteMetric.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Placements Section
function PlacementsSection() {
  const { data: placements } = usePlacements();
  const { data: channels } = useExtendedChannels();
  const createPlacement = useCreatePlacement();
  const updatePlacement = useUpdatePlacement();
  const deletePlacement = useDeletePlacement();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", channel_id: "", mock_type: "MobileFeedMock" as const, aspect_ratio: "1:1", description: "", is_active: true });

  const mockTypes = ["MobileFeedMock", "StoryMock", "ReelsMock", "InStreamMock", "BillboardMock", "SearchAdMock", "DisplayAdMock"] as const;

  const handleSubmit = async () => {
    if (editingItem) {
      await updatePlacement.mutateAsync({ id: editingItem.id, ...formData });
    } else {
      await createPlacement.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", channel_id: "", mock_type: "MobileFeedMock", aspect_ratio: "1:1", description: "", is_active: true }); setEditingItem(null); };
  const openEdit = (item: any) => { setEditingItem(item); setFormData({ name: item.name, channel_id: item.channel_id, mock_type: item.mock_type, aspect_ratio: item.aspect_ratio || "1:1", description: item.description || "", is_active: item.is_active }); setIsDialogOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5" /> Placements</CardTitle><CardDescription>Ad placements per channel</CardDescription></div>
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Placement</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Channel</TableHead><TableHead>Mock Type</TableHead><TableHead>Aspect</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {placements?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.channel?.name}</TableCell>
                <TableCell><Badge variant="outline">{item.mock_type}</Badge></TableCell>
                <TableCell>{item.aspect_ratio}</TableCell>
                <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Placement</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2">
              <Label>Channel</Label>
              <Select value={formData.channel_id} onValueChange={(v) => setFormData({ ...formData, channel_id: v })}><SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger><SelectContent>{channels?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Mock Type</Label>
                <Select value={formData.mock_type} onValueChange={(v: any) => setFormData({ ...formData, mock_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{mockTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="grid gap-2"><Label>Aspect Ratio</Label><Input value={formData.aspect_ratio} onChange={(e) => setFormData({ ...formData, aspect_ratio: e.target.value })} placeholder="e.g., 1:1, 9:16" /></div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /><Label>Active</Label></div>
          </div>
          <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name || !formData.channel_id}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Placement?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deletePlacement.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// AVE Settings Section
function AVESettingsSection() {
  const { data: channels } = useExtendedChannels();
  const queryClient = useQueryClient();

  const { data: cpmRates, refetch: refetchCpm } = useQuery({
    queryKey: ["cpm-rates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cpm_rates").select("*, channels(name)").order("effective_from", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: platformMultipliers } = useQuery({
    queryKey: ["platform-multipliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_multipliers").select("*, channels(name)");
      if (error) throw error;
      return data;
    },
  });

  const { data: engagementMultipliers } = useQuery({
    queryKey: ["engagement-multipliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("engagement_multipliers").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: sentimentMultipliers } = useQuery({
    queryKey: ["sentiment-multipliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sentiment_multipliers").select("*");
      if (error) throw error;
      return data;
    },
  });

  const [editingCpm, setEditingCpm] = useState<string | null>(null);
  const [cpmValue, setCpmValue] = useState("");

  const handleUpdateCpm = async (id: string) => {
    const { error } = await supabase.from("cpm_rates").update({ cpm_value: parseFloat(cpmValue) }).eq("id", id);
    if (error) {
      toast.error("Failed to update CPM rate");
    } else {
      toast.success("CPM rate updated");
      setEditingCpm(null);
      refetchCpm();
    }
  };

  return (
    <div className="space-y-6">
      {/* CPM Rates */}
      <Card>
        <CardHeader><CardTitle>CPM Rates</CardTitle><CardDescription>Cost Per Mille rates for AVE calculation</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Channel</TableHead><TableHead>CPM Value</TableHead><TableHead>Currency</TableHead><TableHead>Effective From</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {cpmRates?.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>{rate.channels?.name}</TableCell>
                  <TableCell>
                    {editingCpm === rate.id ? (
                      <Input type="number" value={cpmValue} onChange={(e) => setCpmValue(e.target.value)} className="w-32" />
                    ) : (
                      rate.cpm_value?.toLocaleString()
                    )}
                  </TableCell>
                  <TableCell>{rate.currency}</TableCell>
                  <TableCell>{new Date(rate.effective_from).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {editingCpm === rate.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdateCpm(rate.id)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCpm(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => { setEditingCpm(rate.id); setCpmValue(rate.cpm_value?.toString() || ""); }}>Edit</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Platform Multipliers */}
      <Card>
        <CardHeader><CardTitle>Platform Multipliers</CardTitle><CardDescription>Multipliers per platform for AVE calculation</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Channel</TableHead><TableHead>Multiplier</TableHead></TableRow></TableHeader>
            <TableBody>
              {platformMultipliers?.map((mult) => (
                <TableRow key={mult.id}><TableCell>{mult.channels?.name}</TableCell><TableCell>{mult.multiplier}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Engagement & Sentiment */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Engagement Multipliers</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Level</TableHead><TableHead>Multiplier</TableHead></TableRow></TableHeader>
              <TableBody>
                {engagementMultipliers?.map((mult) => (
                  <TableRow key={mult.id}><TableCell className="capitalize">{mult.level}</TableCell><TableCell>{mult.multiplier}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sentiment Multipliers</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Sentiment</TableHead><TableHead>Multiplier</TableHead></TableRow></TableHeader>
              <TableBody>
                {sentimentMultipliers?.map((mult) => (
                  <TableRow key={mult.id}><TableCell className="capitalize">{mult.sentiment}</TableCell><TableCell>{mult.multiplier}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* PR Settings */}
      <PRSettingsEditor />
    </div>
  );
}

// Media Outlets Section
function MediaOutletsSection() {
  const { data: outlets } = useAllMediaOutlets();
  const createOutlet = useAddMediaOutlet();
  const updateOutlet = useUpdateMediaOutlet();
  const deleteOutlet = useDeleteMediaOutlet();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", tier: 1, average_monthly_visits: 0, average_page_views_per_article: 0, ecpm: 0, is_active: true });

  const handleSubmit = async () => {
    if (editingItem) {
      await updateOutlet.mutateAsync({ id: editingItem.id, updates: formData });
    } else {
      await createOutlet.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", tier: 1, average_monthly_visits: 0, average_page_views_per_article: 0, ecpm: 0, is_active: true }); setEditingItem(null); };
  const openEdit = (item: any) => { 
    setEditingItem(item); 
    setFormData({ 
      name: item.name, 
      tier: item.tier, 
      average_monthly_visits: item.average_monthly_visits, 
      average_page_views_per_article: item.average_page_views_per_article, 
      ecpm: item.ecpm, 
      is_active: item.is_active 
    }); 
    setIsDialogOpen(true); 
  };

  // Group by tier
  const outletsByTier = outlets?.reduce((acc, outlet) => {
    const tier = outlet.tier;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(outlet);
    return acc;
  }, {} as Record<number, typeof outlets>) || {};

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Media Outlet</Button>
      </div>

      {Object.entries(outletsByTier).sort(([a], [b]) => Number(a) - Number(b)).map(([tier, tierOutlets]) => (
        <Card key={tier}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Tier {tier} Media Outlets
              <Badge variant="secondary">{tierOutlets?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Monthly Visits</TableHead><TableHead>Page Views/Article</TableHead><TableHead>eCPM (IDR)</TableHead><TableHead>Status</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {tierOutlets?.map((outlet) => (
                  <TableRow key={outlet.id}>
                    <TableCell className="font-medium">{outlet.name}</TableCell>
                    <TableCell>{outlet.average_monthly_visits?.toLocaleString()}</TableCell>
                    <TableCell>{outlet.average_page_views_per_article?.toLocaleString()}</TableCell>
                    <TableCell>{outlet.ecpm?.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={outlet.is_active ? "default" : "secondary"}>{outlet.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(outlet)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteId(outlet.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Media Outlet</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tier</Label>
                <Select value={formData.tier.toString()} onValueChange={(v) => setFormData({ ...formData, tier: parseInt(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Tier 1</SelectItem><SelectItem value="2">Tier 2</SelectItem><SelectItem value="3">Tier 3</SelectItem></SelectContent></Select>
              </div>
              <div className="grid gap-2"><Label>eCPM (IDR)</Label><Input type="number" value={formData.ecpm} onChange={(e) => setFormData({ ...formData, ecpm: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Avg Monthly Visits</Label><Input type="number" value={formData.average_monthly_visits} onChange={(e) => setFormData({ ...formData, average_monthly_visits: parseInt(e.target.value) || 0 })} /></div>
              <div className="grid gap-2"><Label>Avg Page Views/Article</Label><Input type="number" value={formData.average_page_views_per_article} onChange={(e) => setFormData({ ...formData, average_page_views_per_article: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} /><Label>Active</Label></div>
          </div>
          <DialogFooter><Button onClick={handleSubmit} disabled={!formData.name}>{editingItem ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Media Outlet?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteOutlet.mutate(deleteId!); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
