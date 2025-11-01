import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";

export const FooterEditor = () => {
  const { data: settings = [] } = useSiteSettings();
  const updateMutation = useUpdateSetting();

  const [footerText, setFooterText] = useState("");

  useEffect(() => {
    const footerSetting = settings.find((s) => s.key === "footer_text");
    if (footerSetting) {
      setFooterText(footerSetting.value as string);
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({
      key: "footer_text",
      value: footerText,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="footerText">Footer Text</Label>
        <Input
          id="footerText"
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          placeholder="© 2025 We Are Social Indonesia. All rights reserved."
        />
      </div>

      <Button onClick={handleSave} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};
