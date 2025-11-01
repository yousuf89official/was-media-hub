-- Add updated_at columns to tables that don't have them
ALTER TABLE public.ave_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.buying_models ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.calculation_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.cpm_rates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.engagement_multipliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.metrics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.platform_multipliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.sentiment_multipliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.sov_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.user_activity_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Drop existing triggers if they exist, then create them
DROP TRIGGER IF EXISTS update_ave_results_updated_at ON public.ave_results;
CREATE TRIGGER update_ave_results_updated_at BEFORE UPDATE ON public.ave_results
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_buying_models_updated_at ON public.buying_models;
CREATE TRIGGER update_buying_models_updated_at BEFORE UPDATE ON public.buying_models
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_calculation_logs_updated_at ON public.calculation_logs;
CREATE TRIGGER update_calculation_logs_updated_at BEFORE UPDATE ON public.calculation_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_channels_updated_at ON public.channels;
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cpm_rates_updated_at ON public.cpm_rates;
CREATE TRIGGER update_cpm_rates_updated_at BEFORE UPDATE ON public.cpm_rates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_engagement_multipliers_updated_at ON public.engagement_multipliers;
CREATE TRIGGER update_engagement_multipliers_updated_at BEFORE UPDATE ON public.engagement_multipliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_metrics_updated_at ON public.metrics;
CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON public.metrics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_objectives_updated_at ON public.objectives;
CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON public.objectives
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_platform_multipliers_updated_at ON public.platform_multipliers;
CREATE TRIGGER update_platform_multipliers_updated_at BEFORE UPDATE ON public.platform_multipliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sentiment_multipliers_updated_at ON public.sentiment_multipliers;
CREATE TRIGGER update_sentiment_multipliers_updated_at BEFORE UPDATE ON public.sentiment_multipliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sov_results_updated_at ON public.sov_results;
CREATE TRIGGER update_sov_results_updated_at BEFORE UPDATE ON public.sov_results
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_activity_logs_updated_at ON public.user_activity_logs;
CREATE TRIGGER update_user_activity_logs_updated_at BEFORE UPDATE ON public.user_activity_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();