import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Image, ExternalLink } from "lucide-react";
import { useAds, useCreateAd, useUpdateAd, useDeleteAd, type Ad } from "@/hooks/useAds";

interface AdCreativeEditorProps {
  adSetId: string;
  adSetName: string;
}

export const AdCreativeEditor = ({ adSetId, adSetName }: AdCreativeEditorProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    status: "draft",
    headline: "",
    description: "",
    cta_text: "",
    destination_url: "",
    creative_url: "",
  });

  const { data: ads, isLoading } = useAds(adSetId);
  const createAd = useCreateAd();
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();

  const handleOpenDialog = (ad?: Ad) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        name: ad.name,
        status: ad.status,
        headline: ad.headline || "",
        description: ad.description || "",
        cta_text: ad.cta_text || "",
        destination_url: ad.destination_url || "",
        creative_url: ad.creative_url || "",
      });
    } else {
      setEditingAd(null);
      setFormData({
        name: "",
        status: "draft",
        headline: "",
        description: "",
        cta_text: "",
        destination_url: "",
        creative_url: "",
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      status: formData.status,
      headline: formData.headline.trim() || undefined,
      description: formData.description.trim() || undefined,
      cta_text: formData.cta_text.trim() || undefined,
      destination_url: formData.destination_url.trim() || undefined,
      creative_url: formData.creative_url.trim() || undefined,
    };

    if (editingAd) {
      await updateAd.mutateAsync({ id: editingAd.id, ...payload });
    } else {
      await createAd.mutateAsync({ ad_set_id: adSetId, ...payload });
    }
    setShowDialog(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this ad?")) {
      await deleteAd.mutateAsync(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500";
      case "paused": return "bg-yellow-500/10 text-yellow-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading ads...</div>;
  }

  return (
    <div className="space-y-3 pl-4 border-l-2 border-muted">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Ads / Creatives</span>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleOpenDialog()}>
          <Plus className="h-3 w-3 mr-1" />
          Add Ad
        </Button>
      </div>

      {!ads || ads.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No ads yet</p>
      ) : (
        <div className="space-y-2">
          {ads.map((ad) => (
            <div 
              key={ad.id} 
              className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                {ad.creative_url ? (
                  <img 
                    src={ad.creative_url} 
                    alt={ad.name} 
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{ad.name}</p>
                  {ad.headline && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{ad.headline}</p>
                  )}
                </div>
                <Badge className={`text-[10px] ${getStatusColor(ad.status)}`}>{ad.status}</Badge>
              </div>
              <div className="flex items-center gap-1">
                {ad.destination_url && (
                  <a href={ad.destination_url} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleOpenDialog(ad)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDelete(ad.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAd ? "Edit Ad" : "Create Ad"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Ad Name</Label>
              <Input
                placeholder="e.g., Summer Sale - Video 1"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

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
              <Label>Creative URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.creative_url}
                onChange={(e) => setFormData(prev => ({ ...prev, creative_url: e.target.value }))}
              />
              {formData.creative_url && (
                <img 
                  src={formData.creative_url} 
                  alt="Preview" 
                  className="w-full max-h-40 object-contain rounded-md border"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Headline</Label>
              <Input
                placeholder="Ad headline text"
                value={formData.headline}
                onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Ad description or body text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input
                  placeholder="e.g., Shop Now"
                  value={formData.cta_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Destination URL</Label>
                <Input
                  placeholder="https://..."
                  value={formData.destination_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination_url: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name.trim() || createAd.isPending || updateAd.isPending}
            >
              {editingAd ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
