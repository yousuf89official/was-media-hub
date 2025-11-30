-- Create creatives table for storing creative assets
CREATE TABLE public.creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  placement_id UUID REFERENCES placements(id),
  
  -- Creative content
  name TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  headline TEXT,
  description TEXT,
  cta_text TEXT,
  display_url TEXT,
  storage_path TEXT,
  
  -- Classification
  source TEXT NOT NULL DEFAULT 'organic' CHECK (source IN ('organic', 'paid', 'kol')),
  is_collaboration BOOLEAN DEFAULT false,
  is_boosted BOOLEAN DEFAULT false,
  
  -- Metrics (stored as JSONB for flexibility)
  metrics JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

-- View policy: Authenticated users can view
CREATE POLICY "Authenticated users can view creatives"
  ON public.creatives FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Manage policy: Staff can manage
CREATE POLICY "Staff can manage creatives"
  ON public.creatives FOR ALL
  USING (
    has_role(auth.uid(), 'MasterAdmin'::app_role) OR 
    has_role(auth.uid(), 'Director'::app_role) OR 
    has_role(auth.uid(), 'Account'::app_role)
  );

-- Updated_at trigger
CREATE TRIGGER update_creatives_updated_at
  BEFORE UPDATE ON public.creatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create creatives storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('creatives', 'creatives', true);

-- Storage policies for creatives bucket
CREATE POLICY "Authenticated users can view creative files"
ON storage.objects FOR SELECT
USING (bucket_id = 'creatives' AND auth.uid() IS NOT NULL);

CREATE POLICY "Staff can upload creative files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'creatives' AND
  (
    has_role(auth.uid(), 'MasterAdmin'::app_role) OR
    has_role(auth.uid(), 'Director'::app_role) OR
    has_role(auth.uid(), 'Account'::app_role)
  )
);

CREATE POLICY "Staff can update creative files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'creatives' AND
  (
    has_role(auth.uid(), 'MasterAdmin'::app_role) OR
    has_role(auth.uid(), 'Director'::app_role) OR
    has_role(auth.uid(), 'Account'::app_role)
  )
);

CREATE POLICY "Staff can delete creative files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'creatives' AND
  (
    has_role(auth.uid(), 'MasterAdmin'::app_role) OR
    has_role(auth.uid(), 'Director'::app_role) OR
    has_role(auth.uid(), 'Account'::app_role)
  )
);