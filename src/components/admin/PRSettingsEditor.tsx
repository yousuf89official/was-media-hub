import { useState } from "react";
import { useECPMValue, useUpdateECPM } from "@/hooks/usePRSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Save, X } from "lucide-react";

export const PRSettingsEditor = () => {
  const { data: ecpmValue, isLoading } = useECPMValue();
  const updateECPM = useUpdateECPM();
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState<string>("");

  const handleEdit = () => {
    setNewValue(ecpmValue?.toString() || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    const value = parseFloat(newValue);
    if (isNaN(value) || value <= 0) {
      return;
    }
    await updateECPM.mutateAsync(value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewValue("");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>PR Settings</CardTitle>
        <CardDescription>
          Configure effective CPM (eCPM) for Media Relations calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ecpm">Effective CPM (eCPM)</Label>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                id="ecpm"
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="45000"
                className="flex-1"
              />
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          ) : (
            <div className="text-2xl font-bold">
              IDR {ecpmValue?.toLocaleString() || "0"}
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            This value is used in the formula: (PR Value / 1000) × eCPM
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
