import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCampaign } from "@/hooks/useCampaigns";
import { useCreateMetric } from "@/hooks/useMetrics";
import { ArrowLeft } from "lucide-react";

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

const MetricsEntry = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: campaign, isLoading } = useCampaign(id || "");
  const createMetric = useCreateMetric();

  const form = useForm<MetricsFormData>({
    resolver: zodResolver(metricsSchema),
    defaultValues: {
      date: "",
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
    if (!id || !campaign) return;

    const payload = {
      campaign_id: id,
      channel_id: campaign.channel_id,
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
    navigate(`/campaigns/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campaign not found</h2>
          <Button onClick={() => navigate("/campaigns")}>Back to Campaigns</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/campaigns/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaign
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Add Metrics for {campaign.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Channel: {campaign.channel?.name}
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/campaigns/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMetric.isPending}>
                    Add Metrics
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsEntry;
