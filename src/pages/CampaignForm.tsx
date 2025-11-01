import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampaign, useCreateCampaign } from "@/hooks/useCampaigns";
import { useUpdateCampaign } from "@/hooks/useUpdateCampaign";
import { useBrands } from "@/hooks/useBrands";
import { useProducts } from "@/hooks/useProducts";
import { useChannels } from "@/hooks/useChannels";
import { useObjectives } from "@/hooks/useObjectives";
import { useBuyingModels } from "@/hooks/useBuyingModels";
import { ArrowLeft } from "lucide-react";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  brand_id: z.string().min(1, "Brand is required"),
  product_id: z.string().optional(),
  channel_id: z.string().min(1, "Channel is required"),
  funnel_type: z.enum(["TOP", "MID", "BOTTOM"]),
  objective_id: z.string().optional(),
  buying_model_id: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  primary_kpi: z.string().optional(),
  secondary_kpi: z.string().optional(),
  status: z.enum(["draft", "running", "finished"]),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const CampaignForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: campaign, isLoading: loadingCampaign } = useCampaign(id || "");
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const { data: brands } = useBrands();
  const { data: channels } = useChannels();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      brand_id: "",
      product_id: "",
      channel_id: "",
      funnel_type: "TOP",
      objective_id: "",
      buying_model_id: "",
      start_date: "",
      end_date: "",
      primary_kpi: "",
      secondary_kpi: "",
      status: "draft",
    },
  });

  const brandId = form.watch("brand_id");
  const channelId = form.watch("channel_id");
  const objectiveId = form.watch("objective_id");

  const { data: products } = useProducts(brandId);
  const { data: objectives } = useObjectives(channelId);
  const { data: buyingModels } = useBuyingModels(channelId, objectiveId);

  useEffect(() => {
    if (campaign && isEdit) {
      form.reset({
        name: campaign.name,
        brand_id: campaign.brand_id,
        product_id: campaign.product_id || "",
        channel_id: campaign.channel_id,
        funnel_type: campaign.funnel_type,
        objective_id: campaign.objective_id || "",
        buying_model_id: campaign.buying_model_id || "",
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        primary_kpi: campaign.primary_kpi || "",
        secondary_kpi: campaign.secondary_kpi || "",
        status: campaign.status,
      });
    }
  }, [campaign, isEdit, form]);

  const onSubmit = async (data: CampaignFormData) => {
    const payload = {
      ...data,
      product_id: data.product_id || null,
      objective_id: data.objective_id || null,
      buying_model_id: data.buying_model_id || null,
      primary_kpi: data.primary_kpi || null,
      secondary_kpi: data.secondary_kpi || null,
    };

    if (isEdit) {
      await updateCampaign.mutateAsync({ id, ...payload });
    } else {
      await createCampaign.mutateAsync(payload);
    }
    navigate("/campaigns");
  };

  if (isEdit && loadingCampaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-full">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/campaigns")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter campaign name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands?.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="product_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!brandId}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="channel_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channel</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select channel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {channels?.map((channel) => (
                              <SelectItem key={channel.id} value={channel.id}>
                                {channel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="funnel_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funnel Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select funnel type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TOP">Top (Awareness)</SelectItem>
                            <SelectItem value="MID">Mid (Consideration)</SelectItem>
                            <SelectItem value="BOTTOM">Bottom (Conversion)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="objective_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objective (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!channelId}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select objective" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {objectives?.map((objective) => (
                              <SelectItem key={objective.id} value={objective.id}>
                                {objective.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buying_model_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buying Model (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!channelId}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select buying model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buyingModels?.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="primary_kpi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary KPI (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Impressions" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondary_kpi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary KPI (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Engagement Rate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="running">Running</SelectItem>
                          <SelectItem value="finished">Finished</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/campaigns")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCampaign.isPending || updateCampaign.isPending}
                  >
                    {isEdit ? "Update Campaign" : "Create Campaign"}
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

export default CampaignForm;
