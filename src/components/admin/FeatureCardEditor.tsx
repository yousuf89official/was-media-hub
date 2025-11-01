import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { IconSelector } from "./IconSelector";
import { useCreateFeature, useUpdateFeature } from "@/hooks/useLandingFeatures";

interface FeatureCardEditorProps {
  feature?: any;
  onComplete?: () => void;
}

export const FeatureCardEditor = ({ feature, onComplete }: FeatureCardEditorProps) => {
  const [title, setTitle] = useState(feature?.title || "");
  const [description, setDescription] = useState(feature?.description || "");
  const [iconName, setIconName] = useState(feature?.icon_name || "BarChart3");
  const [displayOrder, setDisplayOrder] = useState(feature?.display_order || 0);
  const [isActive, setIsActive] = useState(feature?.is_active ?? true);

  const createMutation = useCreateFeature();
  const updateMutation = useUpdateFeature();

  useEffect(() => {
    if (feature) {
      setTitle(feature.title);
      setDescription(feature.description);
      setIconName(feature.icon_name);
      setDisplayOrder(feature.display_order);
      setIsActive(feature.is_active);
    }
  }, [feature]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (feature) {
      updateMutation.mutate(
        {
          id: feature.id,
          title,
          description,
          icon_name: iconName,
          display_order: displayOrder,
          is_active: isActive,
        },
        { onSuccess: onComplete }
      );
    } else {
      createMutation.mutate(
        {
          title,
          description,
          icon_name: iconName,
          display_order: displayOrder,
        },
        { onSuccess: onComplete }
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {title.length}/50 characters
        </p>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          rows={3}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {description.length}/200 characters
        </p>
      </div>

      <div>
        <Label>Icon</Label>
        <IconSelector value={iconName} onChange={setIconName} />
      </div>

      <div>
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input
          id="displayOrder"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
          required
        />
      </div>

      {feature && (
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : feature ? "Update" : "Create"}
        </Button>
        {onComplete && (
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
