import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLandingSection, useUpdateSection } from "@/hooks/useLandingSections";

export const CTASectionEditor = () => {
  const { data: section } = useLandingSection("cta");
  const updateMutation = useUpdateSection();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");

  useEffect(() => {
    if (section?.content) {
      const content = section.content as any;
      setTitle(content.title || "");
      setDescription(content.description || "");
      setButtonText(content.buttonText || "");
    }
  }, [section]);

  const handleSave = () => {
    const currentContent = (section?.content || {}) as any;
    updateMutation.mutate({
      sectionKey: "cta",
      content: {
        ...currentContent,
        title,
        description,
        buttonText,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ctaTitle">CTA Title</Label>
        <Input
          id="ctaTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {title.length}/80 characters
        </p>
      </div>

      <div>
        <Label htmlFor="ctaDescription">CTA Description</Label>
        <Textarea
          id="ctaDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {description.length}/300 characters
        </p>
      </div>

      <div>
        <Label htmlFor="ctaButton">Button Text</Label>
        <Input
          id="ctaButton"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          maxLength={30}
        />
      </div>

      <Button onClick={handleSave} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};
