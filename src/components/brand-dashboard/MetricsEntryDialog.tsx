import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateMetric } from "@/hooks/useMetrics";

const metricsSchema = z.object({
  date: z.string().min(1, "Date is required"),
  impressions: z.string().optional(),
  clicks: z.string().optional(),
  engagements: z.string().optional(),
  reach: z.string().optional(),
  video_views: z.string().optional(),
  spend: z.string().optional(),
  followers: z.string().optional(),
  sentiment_score: z.string().optional(),
});

type MetricsFormData = z.infer<typeof metricsSchema>;

interface MetricsEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  channelId: string;
  campaignName: string;
  onSuccess?: () => void;
}

export function MetricsEntryDialog({
  open,
  onOpenChange,
  campaignId,
  channelId,
  campaignName,
  onSuccess,
}: MetricsEntryDialogProps) {
  const createMetric = useCreateMetric();

  const form = useForm<MetricsFormData>({
    resolver: zodResolver(metricsSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      impressions: "",
      clicks: "",
      engagements: "",
      reach: "",
      video_views: "",
      spend: "",
      followers: "",
      sentiment_score: "",
    },
  });

  const onSubmit = async (data: MetricsFormData) => {
    const payload = {
      campaign_id: campaignId,
      channel_id: channelId,
      date: data.date,
      impressions: data.impressions ? parseInt(data.impressions) : 0,
      clicks: data.clicks ? parseInt(data.clicks) : 0,
      engagements: data.engagements ? parseInt(data.engagements) : 0,
      reach: data.reach ? parseInt(data.reach) : 0,
      video_views: data.video_views ? parseInt(data.video_views) : 0,
      spend: data.spend ? parseFloat(data.spend) : 0,
      followers: data.followers ? parseInt(data.followers) : 0,
      sentiment_score: data.sentiment_score ? parseFloat(data.sentiment_score) : null,
    };

    await createMetric.mutateAsync(payload);
    form.reset();
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Metrics for {campaignName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="impressions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impressions</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clicks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clicks</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engagements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engagements</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reach</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="video_views"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Views</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="spend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spend (IDR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Followers</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sentiment_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sentiment Score (0-100)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" max="100" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMetric.isPending}>
                {createMetric.isPending ? "Adding..." : "Add Metrics"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}