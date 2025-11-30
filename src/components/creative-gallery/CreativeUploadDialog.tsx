import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { usePlacements } from '@/hooks/usePlacements';
import { useCreateCreative, uploadCreativeFile, CreateCreativeInput } from '@/hooks/useCreatives';

interface CreativeUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
}

export function CreativeUploadDialog({ open, onOpenChange, campaignId }: CreativeUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    placement_id: '',
    source: 'paid' as 'organic' | 'paid' | 'kol',
    headline: '',
    description: '',
    cta_text: '',
    display_url: '',
    is_collaboration: false,
    is_boosted: false,
  });

  const { data: placements, isLoading: loadingPlacements } = usePlacements();
  const createCreative = useCreateCreative();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type.startsWith('video/'))) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    setIsUploading(true);
    try {
      let imageUrl = '';
      let storagePath = '';

      if (file) {
        const upload = await uploadCreativeFile(file, campaignId);
        imageUrl = upload.url;
        storagePath = upload.path;
      }

      const input: CreateCreativeInput = {
        campaign_id: campaignId,
        name: formData.name,
        placement_id: formData.placement_id || undefined,
        source: formData.source,
        headline: formData.headline || undefined,
        description: formData.description || undefined,
        cta_text: formData.cta_text || undefined,
        display_url: formData.display_url || undefined,
        is_collaboration: formData.is_collaboration,
        is_boosted: formData.is_boosted,
        image_url: imageUrl || undefined,
        storage_path: storagePath || undefined,
        metrics: {},
      };

      await createCreative.mutateAsync(input);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setFormData({
      name: '',
      placement_id: '',
      source: 'paid',
      headline: '',
      description: '',
      cta_text: '',
      display_url: '',
      is_collaboration: false,
      is_boosted: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">Upload Creative</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              preview ? 'border-primary' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded" />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-0 right-0 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="py-4">
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Images or videos supported
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Creative name"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Placement</Label>
              <Select
                value={formData.placement_id}
                onValueChange={(value) => setFormData({ ...formData, placement_id: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  {placements?.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Source *</Label>
              <Select
                value={formData.source}
                onValueChange={(value: 'organic' | 'paid' | 'kol') => 
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organic" className="text-xs">Organic</SelectItem>
                  <SelectItem value="paid" className="text-xs">Paid</SelectItem>
                  <SelectItem value="kol" className="text-xs">KOL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label className="text-xs">Headline</Label>
              <Input
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="Ad headline"
                className="h-8 text-xs"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Creative description or caption"
                className="text-xs min-h-[60px]"
              />
            </div>

            <div>
              <Label className="text-xs">CTA Text</Label>
              <Input
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                placeholder="Shop Now"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Display URL</Label>
              <Input
                value={formData.display_url}
                onChange={(e) => setFormData({ ...formData, display_url: e.target.value })}
                placeholder="example.com/shop"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 py-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_collaboration}
                onCheckedChange={(checked) => setFormData({ ...formData, is_collaboration: checked })}
              />
              <Label className="text-xs">Collaboration Post</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_boosted}
                onCheckedChange={(checked) => setFormData({ ...formData, is_boosted: checked })}
              />
              <Label className="text-xs">Boosted</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!formData.name || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3 mr-1" />
                  Upload Creative
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
