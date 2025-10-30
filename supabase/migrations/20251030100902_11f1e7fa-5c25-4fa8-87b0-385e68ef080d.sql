-- Create user activity logs table
CREATE TABLE public.user_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  page_path text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs"
ON public.user_activity_logs
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'MasterAdmin'::app_role));

-- Authenticated users can insert their own activity logs
CREATE POLICY "Users can insert own activity logs"
ON public.user_activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create calculation logs table
CREATE TABLE public.calculation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_type text NOT NULL DEFAULT 'AVE',
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  inputs jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calculation_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own calculation logs
CREATE POLICY "Users can view own calculation logs"
ON public.calculation_logs
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'MasterAdmin'::app_role));

-- Authenticated users can insert their own calculation logs
CREATE POLICY "Users can insert own calculation logs"
ON public.calculation_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_calculation_logs_user_id ON public.calculation_logs(user_id);
CREATE INDEX idx_calculation_logs_created_at ON public.calculation_logs(created_at DESC);