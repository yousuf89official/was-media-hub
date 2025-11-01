import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLandingSection, useUpdateSection } from "@/hooks/useLandingSections";

export const HeroSectionEditor = () => {
  const { data: section } = useLandingSection("hero");
  const updateMutation = useUpdateSection();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [primaryCtaText, setPrimaryCtaText] = useState("");
  const [secondaryCtaText, setSecondaryCtaText] = useState("");

  useEffect(() => {
    if (section?.content) {
      const content = section.content as any;
      setTitle(content.title || "");
      setSubtitle(content.subtitle || "");
      setPrimaryCtaText(content.primaryCtaText || "");
      setSecondaryCtaText(content.secondaryCtaText || "");
    }
  }, [section]);

  const handleSave = () => {
    const currentContent = (section?.content || {}) as any;
    updateMutation.mutate({
      sectionKey: "hero",
      content: {
        ...currentContent,
        title,
        subtitle,
        primaryCtaText,
        secondaryCtaText,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Hero Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {title.length}/100 characters
        </p>
      </div>

      <div>
        <Label htmlFor="subtitle">Hero Subtitle</Label>
        <Textarea
          id="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          maxLength={200}
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle.length}/200 characters
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primaryCta">Primary Button Text</Label>
          <Input
            id="primaryCta"
            value={primaryCtaText}
            onChange={(e) => setPrimaryCtaText(e.target.value)}
            maxLength={30}
          />
        </div>

        <div>
          <Label htmlFor="secondaryCta">Secondary Button Text</Label>
          <Input
            id="secondaryCta"
            value={secondaryCtaText}
            onChange={(e) => setSecondaryCtaText(e.target.value)}
            maxLength={30}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};
