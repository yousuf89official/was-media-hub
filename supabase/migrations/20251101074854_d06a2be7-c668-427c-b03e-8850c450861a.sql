-- Enable realtime for metrics table
ALTER PUBLICATION supabase_realtime ADD TABLE public.metrics;

-- Enable realtime for campaigns table
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_metrics_campaign_date ON public.metrics(campaign_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_status ON public.campaigns(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculation_logs_user_date ON public.calculation_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ave_results_campaign ON public.ave_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_date ON public.user_activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_channel ON public.metrics(channel_id);
