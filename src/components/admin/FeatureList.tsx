import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLandingFeatures, useDeleteFeature } from "@/hooks/useLandingFeatures";
import { FeatureCardEditor } from "./FeatureCardEditor";
import * as Icons from "lucide-react";

export const FeatureList = () => {
  const { data: features = [] } = useLandingFeatures();
  const deleteMutation = useDeleteFeature();
  const [editingFeature, setEditingFeature] = useState<any>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Feature Cards</h3>
        <Dialog>
          <Button asChild>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Feature</DialogTitle>
              </DialogHeader>
              <FeatureCardEditor />
            </DialogContent>
          </Button>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {features.map((feature) => {
          const IconComponent = (Icons as any)[feature.icon_name];
          return (
            <Card key={feature.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  {IconComponent && (
                    <IconComponent className="w-8 h-8 text-primary flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{feature.title}</h4>
                      {!feature.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      <Badge variant="outline">Order: {feature.display_order}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingFeature(feature)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Feature</DialogTitle>
                      </DialogHeader>
                      <FeatureCardEditor
                        feature={editingFeature}
                        onComplete={() => setEditingFeature(null)}
                      />
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Feature?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{feature.title}". This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(feature.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {editingFeature && (
        <Dialog open={!!editingFeature} onOpenChange={() => setEditingFeature(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Feature</DialogTitle>
            </DialogHeader>
            <FeatureCardEditor
              feature={editingFeature}
              onComplete={() => setEditingFeature(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
