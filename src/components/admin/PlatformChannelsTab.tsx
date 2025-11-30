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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Layers, Target, DollarSign, BarChart3, Layout, Newspaper, Settings } from "lucide-react";
import { useChannelCategories, useCreateChannelCategory, useUpdateChannelCategory, useDeleteChannelCategory } from "@/hooks/useChannelCategories";
import { useExtendedChannels, useCreateExtendedChannel, useUpdateExtendedChannel, useDeleteExtendedChannel } from "@/hooks/useExtendedChannels";
import { useExtendedObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from "@/hooks/useExtendedObjectives";
import { useExtendedBuyingModels, useCreateBuyingModel, useUpdateBuyingModel, useDeleteBuyingModel } from "@/hooks/useExtendedBuyingModels";
import { usePlacements, useCreatePlacement, useUpdatePlacement, useDeletePlacement } from "@/hooks/usePlacements";
import { useAllMediaOutlets, useAddMediaOutlet, useUpdateMediaOutlet, useDeleteMediaOutlet } from "@/hooks/useMediaOutlets";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PRSettingsEditor } from "./PRSettingsEditor";

type DialogMode = 
  | { type: "category"; item?: any }
  | { type: "channel"; categoryId?: string; item?: any }
  | { type: "objective"; channelId: string; item?: any }
  | { type: "buying-model"; channelId: string; item?: any }
  | { type: "placement"; channelId: string; item?: any }
  | { type: "media-outlet"; item?: any }
  | null;

type DeleteTarget = 
  | { type: "category"; id: string }
  | { type: "channel"; id: string }
  | { type: "objective"; id: string }
  | { type: "buying-model"; id: string }
  | { type: "placement"; id: string }
  | { type: "media-outlet"; id: string }
  | null;

export function PlatformChannelsTab() {
  const { data: categories } = useChannelCategories();
  const { data: channels } = useExtendedChannels();
  const { data: objectives } = useExtendedObjectives();
  const { data: buyingModels } = useExtendedBuyingModels();
  const { data: placements } = usePlacements();
  const { data: outlets } = useAllMediaOutlets();

  const createCategory = useCreateChannelCategory();
  const updateCategory = useUpdateChannelCategory();
  const deleteCategory = useDeleteChannelCategory();
  const createChannel = useCreateExtendedChannel();
  const updateChannel = useUpdateExtendedChannel();
  const deleteChannel = useDeleteExtendedChannel();
  const createObjective = useCreateObjective();
  const updateObjective = useUpdateObjective();
  const deleteObjective = useDeleteObjective();
  const createBuyingModel = useCreateBuyingModel();
  const updateBuyingModel = useUpdateBuyingModel();
  const deleteBuyingModel = useDeleteBuyingModel();
  const createPlacement = useCreatePlacement();
  const updatePlacement = useUpdatePlacement();
  const deletePlacement = useDeletePlacement();
  const createOutlet = useAddMediaOutlet();
  const updateOutlet = useUpdateMediaOutlet();
  const deleteOutlet = useDeleteMediaOutlet();

  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());
  const [aveSettingsOpen, setAveSettingsOpen] = useState(false);
  const [mediaOutletsOpen, setMediaOutletsOpen] = useState(false);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", brand_color: "#3b82f6", is_active: true });
  const [channelForm, setChannelForm] = useState({ name: "", channel_type: "Social" as const, channel_category_id: "", brand_color: "#3b82f6", display_order: 0 });
  const [objectiveForm, setObjectiveForm] = useState({ name: "", description: "", channel_id: "", funnel_type: "" as any });
  const [buyingModelForm, setBuyingModelForm] = useState({ name: "", description: "", channel_id: "", objective_id: "" });
  const [placementForm, setPlacementForm] = useState({ name: "", channel_id: "", mock_type: "MobileFeedMock" as const, aspect_ratio: "1:1", description: "", is_active: true });
  const [outletForm, setOutletForm] = useState({ name: "", tier: 1, average_monthly_visits: 0, average_page_views_per_article: 0, ecpm: 0, is_active: true });

  const channelTypes = ["Social", "Programmatic", "Display", "PR", "Email", "Owned"] as const;
  const mockTypes = ["MobileFeedMock", "StoryMock", "ReelsMock", "InStreamMock", "BillboardMock", "SearchAdMock", "DisplayAdMock"] as const;

  const togglePlatform = (id: string) => {
    setExpandedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleChannel = (id: string) => {
    setExpandedChannels(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getChannelsByCategory = (categoryId: string) => channels?.filter(c => c.channel_category_id === categoryId) || [];
  const getObjectivesByChannel = (channelId: string) => objectives?.filter(o => o.channel_id === channelId) || [];
  const getBuyingModelsByChannel = (channelId: string) => buyingModels?.filter(b => b.channel_id === channelId) || [];
  const getPlacementsByChannel = (channelId: string) => placements?.filter(p => p.channel_id === channelId) || [];

  const getFunnelBadgeColor = (funnel: string | null) => {
    switch (funnel) {
      case "TOP": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "MID": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "BOTTOM": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const resetForms = () => {
    setCategoryForm({ name: "", brand_color: "#3b82f6", is_active: true });
    setChannelForm({ name: "", channel_type: "Social", channel_category_id: "", brand_color: "#3b82f6", display_order: 0 });
    setObjectiveForm({ name: "", description: "", channel_id: "", funnel_type: "" });
    setBuyingModelForm({ name: "", description: "", channel_id: "", objective_id: "" });
    setPlacementForm({ name: "", channel_id: "", mock_type: "MobileFeedMock", aspect_ratio: "1:1", description: "", is_active: true });
    setOutletForm({ name: "", tier: 1, average_monthly_visits: 0, average_page_views_per_article: 0, ecpm: 0, is_active: true });
  };

  const openDialog = (mode: DialogMode) => {
    resetForms();
    if (mode?.type === "category" && mode.item) {
      setCategoryForm({ name: mode.item.name, brand_color: mode.item.brand_color || "#3b82f6", is_active: mode.item.is_active });
    } else if (mode?.type === "channel") {
      if (mode.item) {
        setChannelForm({ name: mode.item.name, channel_type: mode.item.channel_type, channel_category_id: mode.item.channel_category_id || "", brand_color: mode.item.brand_color || "#3b82f6", display_order: mode.item.display_order || 0 });
      } else if (mode.categoryId) {
        setChannelForm(prev => ({ ...prev, channel_category_id: mode.categoryId! }));
      }
    } else if (mode?.type === "objective") {
      if (mode.item) {
        setObjectiveForm({ name: mode.item.name, description: mode.item.description || "", channel_id: mode.item.channel_id || "", funnel_type: mode.item.funnel_type || "" });
      } else {
        setObjectiveForm(prev => ({ ...prev, channel_id: mode.channelId }));
      }
    } else if (mode?.type === "buying-model") {
      if (mode.item) {
        setBuyingModelForm({ name: mode.item.name, description: mode.item.description || "", channel_id: mode.item.channel_id || "", objective_id: mode.item.objective_id || "" });
      } else {
        setBuyingModelForm(prev => ({ ...prev, channel_id: mode.channelId }));
      }
    } else if (mode?.type === "placement") {
      if (mode.item) {
        setPlacementForm({ name: mode.item.name, channel_id: mode.item.channel_id, mock_type: mode.item.mock_type, aspect_ratio: mode.item.aspect_ratio || "1:1", description: mode.item.description || "", is_active: mode.item.is_active });
      } else {
        setPlacementForm(prev => ({ ...prev, channel_id: mode.channelId }));
      }
    } else if (mode?.type === "media-outlet" && mode.item) {
      setOutletForm({ name: mode.item.name, tier: mode.item.tier, average_monthly_visits: mode.item.average_monthly_visits, average_page_views_per_article: mode.item.average_page_views_per_article, ecpm: mode.item.ecpm, is_active: mode.item.is_active });
    }
    setDialogMode(mode);
  };

  const handleSubmit = async () => {
    if (!dialogMode) return;

    try {
      if (dialogMode.type === "category") {
        if (dialogMode.item) await updateCategory.mutateAsync({ id: dialogMode.item.id, ...categoryForm });
        else await createCategory.mutateAsync(categoryForm);
      } else if (dialogMode.type === "channel") {
        if (dialogMode.item) await updateChannel.mutateAsync({ id: dialogMode.item.id, ...channelForm });
        else await createChannel.mutateAsync(channelForm);
      } else if (dialogMode.type === "objective") {
        const payload = { ...objectiveForm, channel_id: objectiveForm.channel_id || null, funnel_type: objectiveForm.funnel_type || null };
        if (dialogMode.item) await updateObjective.mutateAsync({ id: dialogMode.item.id, ...payload });
        else await createObjective.mutateAsync(payload);
      } else if (dialogMode.type === "buying-model") {
        const payload = { ...buyingModelForm, channel_id: buyingModelForm.channel_id || null, objective_id: buyingModelForm.objective_id || null };
        if (dialogMode.item) await updateBuyingModel.mutateAsync({ id: dialogMode.item.id, ...payload });
        else await createBuyingModel.mutateAsync(payload);
      } else if (dialogMode.type === "placement") {
        if (dialogMode.item) await updatePlacement.mutateAsync({ id: dialogMode.item.id, ...placementForm });
        else await createPlacement.mutateAsync(placementForm);
      } else if (dialogMode.type === "media-outlet") {
        if (dialogMode.item) await updateOutlet.mutateAsync({ id: dialogMode.item.id, updates: outletForm });
        else await createOutlet.mutateAsync(outletForm);
      }
      setDialogMode(null);
      resetForms();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "category") deleteCategory.mutate(deleteTarget.id);
    else if (deleteTarget.type === "channel") deleteChannel.mutate(deleteTarget.id);
    else if (deleteTarget.type === "objective") deleteObjective.mutate(deleteTarget.id);
    else if (deleteTarget.type === "buying-model") deleteBuyingModel.mutate(deleteTarget.id);
    else if (deleteTarget.type === "placement") deletePlacement.mutate(deleteTarget.id);
    else if (deleteTarget.type === "media-outlet") deleteOutlet.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Group outlets by tier
  const outletsByTier = outlets?.reduce((acc, outlet) => {
    const tier = outlet.tier;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(outlet);
    return acc;
  }, {} as Record<number, typeof outlets>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform & Channels</h2>
          <p className="text-muted-foreground">Manage platforms, channels, objectives, buying models, and placements</p>
        </div>
        <Button onClick={() => openDialog({ type: "category" })}>
          <Plus className="h-4 w-4 mr-2" /> Add Platform
        </Button>
      </div>

      {/* Hierarchical Platforms & Channels */}
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
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.brand_color || "#3b82f6" }} />
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
                        <Button size="sm" variant="outline" onClick={() => openDialog({ type: "channel", categoryId: category.id })}>
                          <Plus className="h-4 w-4 mr-1" /> Channel
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openDialog({ type: "category", item: category })}>
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
                      <div className="grid gap-3">
                        {categoryChannels.map((channel) => {
                          const channelObjectives = getObjectivesByChannel(channel.id);
                          const channelBuyingModels = getBuyingModelsByChannel(channel.id);
                          const channelPlacements = getPlacementsByChannel(channel.id);
                          const isChannelExpanded = expandedChannels.has(channel.id);

                          return (
                            <Collapsible key={channel.id} open={isChannelExpanded} onOpenChange={() => toggleChannel(channel.id)}>
                              <div className="border rounded-lg bg-card">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                      {isChannelExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.brand_color || "#666" }} />
                                      <div>
                                        <span className="font-medium">{channel.name}</span>
                                        <Badge variant="outline" className="ml-2 text-xs">{channel.channel_type}</Badge>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                      <Badge variant="secondary" className="text-[10px]">{channelObjectives.length} obj</Badge>
                                      <Badge variant="secondary" className="text-[10px]">{channelBuyingModels.length} models</Badge>
                                      <Badge variant="secondary" className="text-[10px]">{channelPlacements.length} placements</Badge>
                                      <Button variant="ghost" size="icon" onClick={() => openDialog({ type: "channel", item: channel })}>
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: "channel", id: channel.id })}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="px-4 pb-4 pt-1 space-y-4 border-t bg-muted/20">
                                    {/* Objectives */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                          <Target className="h-3 w-3" /> Objectives
                                        </p>
                                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => openDialog({ type: "objective", channelId: channel.id })}>
                                          <Plus className="h-3 w-3 mr-1" /> Add
                                        </Button>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {channelObjectives.map(obj => (
                                          <Badge 
                                            key={obj.id} 
                                            variant="outline" 
                                            className={`text-[10px] group cursor-pointer ${getFunnelBadgeColor(obj.funnel_type)}`}
                                          >
                                            {obj.name}
                                            {obj.funnel_type && <span className="ml-1 opacity-70">({obj.funnel_type})</span>}
                                            <span className="hidden group-hover:inline-flex ml-1 gap-0.5">
                                              <Pencil className="h-2.5 w-2.5 hover:text-primary" onClick={(e) => { e.stopPropagation(); openDialog({ type: "objective", channelId: channel.id, item: obj }); }} />
                                              <Trash2 className="h-2.5 w-2.5 hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "objective", id: obj.id }); }} />
                                            </span>
                                          </Badge>
                                        ))}
                                        {channelObjectives.length === 0 && <span className="text-xs text-muted-foreground italic">No objectives</span>}
                                      </div>
                                    </div>

                                    {/* Buying Models */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                          <DollarSign className="h-3 w-3" /> Buying Models
                                        </p>
                                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => openDialog({ type: "buying-model", channelId: channel.id })}>
                                          <Plus className="h-3 w-3 mr-1" /> Add
                                        </Button>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {channelBuyingModels.map(bm => (
                                          <Badge key={bm.id} variant="secondary" className="text-[10px] group cursor-pointer">
                                            {bm.name}
                                            <span className="hidden group-hover:inline-flex ml-1 gap-0.5">
                                              <Pencil className="h-2.5 w-2.5 hover:text-primary" onClick={(e) => { e.stopPropagation(); openDialog({ type: "buying-model", channelId: channel.id, item: bm }); }} />
                                              <Trash2 className="h-2.5 w-2.5 hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "buying-model", id: bm.id }); }} />
                                            </span>
                                          </Badge>
                                        ))}
                                        {channelBuyingModels.length === 0 && <span className="text-xs text-muted-foreground italic">No buying models</span>}
                                      </div>
                                    </div>

                                    {/* Placements */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                          <Layout className="h-3 w-3" /> Placements
                                        </p>
                                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => openDialog({ type: "placement", channelId: channel.id })}>
                                          <Plus className="h-3 w-3 mr-1" /> Add
                                        </Button>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {channelPlacements.map(pl => (
                                          <Badge key={pl.id} variant="outline" className="text-[10px] group cursor-pointer">
                                            {pl.name}
                                            {pl.aspect_ratio && <span className="ml-1 opacity-70">({pl.aspect_ratio})</span>}
                                            <span className="hidden group-hover:inline-flex ml-1 gap-0.5">
                                              <Pencil className="h-2.5 w-2.5 hover:text-primary" onClick={(e) => { e.stopPropagation(); openDialog({ type: "placement", channelId: channel.id, item: pl }); }} />
                                              <Trash2 className="h-2.5 w-2.5 hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "placement", id: pl.id }); }} />
                                            </span>
                                          </Badge>
                                        ))}
                                        {channelPlacements.length === 0 && <span className="text-xs text-muted-foreground italic">No placements</span>}
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* AVE Settings - Collapsible */}
      <Collapsible open={aveSettingsOpen} onOpenChange={setAveSettingsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {aveSettingsOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <Settings className="h-5 w-5" />
                  <CardTitle>AVE Settings</CardTitle>
                </div>
                <Badge variant="outline">CPM Rates, Multipliers, PR Settings</Badge>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <AVESettingsContent />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Media Outlets - Collapsible */}
      <Collapsible open={mediaOutletsOpen} onOpenChange={setMediaOutletsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {mediaOutletsOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <Newspaper className="h-5 w-5" />
                  <CardTitle>Media Outlets</CardTitle>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <Badge variant="outline">{outlets?.length || 0} outlets</Badge>
                  <Button size="sm" variant="outline" onClick={() => openDialog({ type: "media-outlet" })}>
                    <Plus className="h-4 w-4 mr-1" /> Add Outlet
                  </Button>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(outletsByTier).sort(([a], [b]) => Number(a) - Number(b)).map(([tier, tierOutlets]) => (
                  <div key={tier} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      Tier {tier} <Badge variant="secondary">{tierOutlets?.length || 0}</Badge>
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Monthly Visits</TableHead>
                          <TableHead>Page Views/Article</TableHead>
                          <TableHead>eCPM (IDR)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tierOutlets?.map((outlet) => (
                          <TableRow key={outlet.id}>
                            <TableCell className="font-medium">{outlet.name}</TableCell>
                            <TableCell>{outlet.average_monthly_visits?.toLocaleString()}</TableCell>
                            <TableCell>{outlet.average_page_views_per_article?.toLocaleString()}</TableCell>
                            <TableCell>{outlet.ecpm?.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={outlet.is_active ? "default" : "secondary"}>
                                {outlet.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openDialog({ type: "media-outlet", item: outlet })}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: "media-outlet", id: outlet.id })}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
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
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Unified Dialog */}
      <Dialog open={!!dialogMode} onOpenChange={(open) => { if (!open) { setDialogMode(null); resetForms(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode?.item ? "Edit" : "Add"} {
                dialogMode?.type === "category" ? "Platform" :
                dialogMode?.type === "channel" ? "Channel" :
                dialogMode?.type === "objective" ? "Objective" :
                dialogMode?.type === "buying-model" ? "Buying Model" :
                dialogMode?.type === "placement" ? "Placement" :
                dialogMode?.type === "media-outlet" ? "Media Outlet" : ""
              }
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Category Form */}
            {dialogMode?.type === "category" && (
              <>
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
              </>
            )}

            {/* Channel Form */}
            {dialogMode?.type === "channel" && (
              <>
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
                {!dialogMode.categoryId && (
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
              </>
            )}

            {/* Objective Form */}
            {dialogMode?.type === "objective" && (
              <>
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input value={objectiveForm.name} onChange={(e) => setObjectiveForm({ ...objectiveForm, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Funnel Type</Label>
                  <Select value={objectiveForm.funnel_type} onValueChange={(v: any) => setObjectiveForm({ ...objectiveForm, funnel_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Any funnel" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="TOP">Top (Awareness)</SelectItem>
                      <SelectItem value="MID">Mid (Consideration)</SelectItem>
                      <SelectItem value="BOTTOM">Bottom (Conversion)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={objectiveForm.description} onChange={(e) => setObjectiveForm({ ...objectiveForm, description: e.target.value })} />
                </div>
              </>
            )}

            {/* Buying Model Form */}
            {dialogMode?.type === "buying-model" && (
              <>
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input value={buyingModelForm.name} onChange={(e) => setBuyingModelForm({ ...buyingModelForm, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Objective (Optional)</Label>
                  <Select value={buyingModelForm.objective_id} onValueChange={(v) => setBuyingModelForm({ ...buyingModelForm, objective_id: v })}>
                    <SelectTrigger><SelectValue placeholder="All objectives" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {objectives?.filter(o => o.channel_id === buyingModelForm.channel_id).map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={buyingModelForm.description} onChange={(e) => setBuyingModelForm({ ...buyingModelForm, description: e.target.value })} />
                </div>
              </>
            )}

            {/* Placement Form */}
            {dialogMode?.type === "placement" && (
              <>
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input value={placementForm.name} onChange={(e) => setPlacementForm({ ...placementForm, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Mock Type</Label>
                    <Select value={placementForm.mock_type} onValueChange={(v: any) => setPlacementForm({ ...placementForm, mock_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{mockTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Aspect Ratio</Label>
                    <Input value={placementForm.aspect_ratio} onChange={(e) => setPlacementForm({ ...placementForm, aspect_ratio: e.target.value })} placeholder="e.g., 1:1, 9:16" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={placementForm.description} onChange={(e) => setPlacementForm({ ...placementForm, description: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={placementForm.is_active} onCheckedChange={(v) => setPlacementForm({ ...placementForm, is_active: v })} />
                  <Label>Active</Label>
                </div>
              </>
            )}

            {/* Media Outlet Form */}
            {dialogMode?.type === "media-outlet" && (
              <>
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input value={outletForm.name} onChange={(e) => setOutletForm({ ...outletForm, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tier</Label>
                    <Select value={outletForm.tier.toString()} onValueChange={(v) => setOutletForm({ ...outletForm, tier: parseInt(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Tier 1</SelectItem>
                        <SelectItem value="2">Tier 2</SelectItem>
                        <SelectItem value="3">Tier 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>eCPM (IDR)</Label>
                    <Input type="number" value={outletForm.ecpm} onChange={(e) => setOutletForm({ ...outletForm, ecpm: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Avg Monthly Visits</Label>
                    <Input type="number" value={outletForm.average_monthly_visits} onChange={(e) => setOutletForm({ ...outletForm, average_monthly_visits: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Avg Page Views/Article</Label>
                    <Input type="number" value={outletForm.average_page_views_per_article} onChange={(e) => setOutletForm({ ...outletForm, average_page_views_per_article: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={outletForm.is_active} onCheckedChange={(v) => setOutletForm({ ...outletForm, is_active: v })} />
                  <Label>Active</Label>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={
              (dialogMode?.type === "category" && !categoryForm.name) ||
              (dialogMode?.type === "channel" && !channelForm.name) ||
              (dialogMode?.type === "objective" && !objectiveForm.name) ||
              (dialogMode?.type === "buying-model" && !buyingModelForm.name) ||
              (dialogMode?.type === "placement" && (!placementForm.name || !placementForm.channel_id)) ||
              (dialogMode?.type === "media-outlet" && !outletForm.name)
            }>
              {dialogMode?.item ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {
                deleteTarget?.type === "category" ? "Platform" :
                deleteTarget?.type === "channel" ? "Channel" :
                deleteTarget?.type === "objective" ? "Objective" :
                deleteTarget?.type === "buying-model" ? "Buying Model" :
                deleteTarget?.type === "placement" ? "Placement" :
                deleteTarget?.type === "media-outlet" ? "Media Outlet" : ""
              }?
            </AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// AVE Settings Content (kept as separate component for clarity)
function AVESettingsContent() {
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
      <div>
        <h4 className="font-semibold mb-3">CPM Rates</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>CPM Value</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Effective From</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
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
      </div>

      {/* Platform Multipliers */}
      <div>
        <h4 className="font-semibold mb-3">Platform Multipliers</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Multiplier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platformMultipliers?.map((mult) => (
              <TableRow key={mult.id}>
                <TableCell>{mult.channels?.name}</TableCell>
                <TableCell>{mult.multiplier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Engagement & Sentiment */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Engagement Multipliers</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Multiplier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {engagementMultipliers?.map((mult) => (
                <TableRow key={mult.id}>
                  <TableCell className="capitalize">{mult.level}</TableCell>
                  <TableCell>{mult.multiplier}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Sentiment Multipliers</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sentiment</TableHead>
                <TableHead>Multiplier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sentimentMultipliers?.map((mult) => (
                <TableRow key={mult.id}>
                  <TableCell className="capitalize">{mult.sentiment}</TableCell>
                  <TableCell>{mult.multiplier}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PR Settings */}
      <PRSettingsEditor />
    </div>
  );
}
