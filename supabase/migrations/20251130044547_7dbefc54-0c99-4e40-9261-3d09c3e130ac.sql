-- Create data_sources table for storing sheet connections
CREATE TABLE public.data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'google_sheets',
  sheet_id TEXT,
  sheet_url TEXT,
  sheet_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT DEFAULT 'manual',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data_source_mappings for mapping sheet ranges to metrics
CREATE TABLE public.data_source_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_source_id UUID NOT NULL REFERENCES public.data_sources(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  cell_range TEXT NOT NULL,
  sheet_tab TEXT,
  transform_type TEXT DEFAULT 'none',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_source_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for data_sources
CREATE POLICY "Authenticated users can view data_sources" 
  ON public.data_sources FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage data_sources" 
  ON public.data_sources FOR ALL 
  USING (
    has_role(auth.uid(), 'MasterAdmin'::app_role) OR 
    has_role(auth.uid(), 'Director'::app_role) OR 
    has_role(auth.uid(), 'Account'::app_role)
  );

-- RLS policies for data_source_mappings
CREATE POLICY "Authenticated users can view data_source_mappings" 
  ON public.data_source_mappings FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage data_source_mappings" 
  ON public.data_source_mappings FOR ALL 
  USING (
    has_role(auth.uid(), 'MasterAdmin'::app_role) OR 
    has_role(auth.uid(), 'Director'::app_role) OR 
    has_role(auth.uid(), 'Account'::app_role)
  );

-- Create updated_at triggers
CREATE TRIGGER update_data_sources_updated_at
  BEFORE UPDATE ON public.data_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_source_mappings_updated_at
  BEFORE UPDATE ON public.data_source_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();