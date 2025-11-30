import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { useCreateAdSet, useUpdateAdSet, useDeleteAdSet, type AdSet } from "@/hooks/useAdSets";
import { usePlacements } from "@/hooks/usePlacements";
import { AdCreativeEditor } from "./AdCreativeEditor";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdSetEditorProps {
  campaignChannelConfigId: string;
  channelId: string;
  channelName: string;
  adSets: AdSet[];
}

export const AdSetEditor = ({ 
  campaignChannelConfigId, 
  channelId, 
  channelName,
  adSets 
}: AdSetEditorProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAdSet, setEditingAdSet] = useState<AdSet | null>(null);
  const [expandedAdSets, setExpandedAdSets] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    name: "",
    status: "draft",
    budget: "",
    start_date: "",
    end_date: "",
    placements: [] as string[],
  });

  const { data: placements } = usePlacements(channelId);
  const createAdSet = useCreateAdSet();
  const updateAdSet = useUpdateAdSet();
  const deleteAdSet = useDeleteAdSet();

  const handleOpenDialog = (adSet?: AdSet) => {
    if (adSet) {
      setEditingAdSet(adSet);
      setFormData({
        name: adSet.name,
        status: adSet.status,
        budget: adSet.budget?.toString() || "",
        start_date: adSet.start_date || "",
        end_date: adSet.end_date || "",
        placements: adSet.placements || [],
      });
    } else {
      setEditingAdSet(null);
      setFormData({
        name: "",
        status: "draft",
        budget: "",
        start_date: "",
        end_date: "",
        placements: [],
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      status: formData.status,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      placements: formData.placements.length > 0 ? formData.placements : undefined,
    };

    if (editingAdSet) {
      await updateAdSet.mutateAsync({ id: editingAdSet.id, ...payload });
    } else {
      await createAdSet.mutateAsync({ 
        campaign_channel_config_id: campaignChannelConfigId, 
        ...payload 
      });
    }
    setShowDialog(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this ad set and all its ads?")) {
      await deleteAdSet.mutateAsync(id);
    }
  };

  const toggleExpanded = (adSetId: string) => {
    const newExpanded = new Set(expandedAdSets);
    if (newExpanded.has(adSetId)) {
      newExpanded.delete(adSetId);
    } else {
      newExpanded.add(adSetId);
    }
    setExpandedAdSets(newExpanded);
  };

  const togglePlacement = (placementId: string) => {
    setFormData(prev => ({
      ...prev,
      placements: prev.placements.includes(placementId)
        ? prev.placements.filter(p => p !== placementId)
        : [...prev.placements, placementId],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500";
      case "paused": return "bg-yellow-500/10 text-yellow-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{channelName} Ad Sets</span>
          <Badge variant="outline">{adSets.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => handleOpenDialog()}>
          <Plus className="h-3 w-3 mr-1" />
          Add Ad Set
        </Button>
      </div>

      {adSets.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
          No ad sets yet. Create one to start adding creatives.
        </p>
      ) : (
        <div className="space-y-2">
          {adSets.map((adSet) => (
            <Collapsible 
              key={adSet.id} 
              open={expandedAdSets.has(adSet.id)}
              onOpenChange={() => toggleExpanded(adSet.id)}
            >
              <Card className="border">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
                      {expandedAdSets.has(adSet.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <CardTitle className="text-sm font-medium">{adSet.name}</CardTitle>
                      <Badge className={getStatusColor(adSet.status)}>{adSet.status}</Badge>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-1">
                      {adSet.budget && (
                        <span className="text-xs text-muted-foreground mr-2">
                          {adSet.budget.toLocaleString()} IDR
                        </span>
                      )}
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpenDialog(adSet)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(adSet.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 pb-4">
                    <AdCreativeEditor adSetId={adSet.id} adSetName={adSet.name} />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAdSet ? "Edit Ad Set" : "Create Ad Set"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ad Set Name</Label>
              <Input
                placeholder="e.g., Awareness - Women 25-34"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget (IDR)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            {placements && placements.length > 0 && (
              <div className="space-y-2">
                <Label>Placements</Label>
                <div className="flex flex-wrap gap-2">
                  {placements.map((placement) => (
                    <Badge
                      key={placement.id}
                      variant={formData.placements.includes(placement.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePlacement(placement.id)}
                    >
                      {placement.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name.trim() || createAdSet.isPending || updateAdSet.isPending}
            >
              {editingAdSet ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
