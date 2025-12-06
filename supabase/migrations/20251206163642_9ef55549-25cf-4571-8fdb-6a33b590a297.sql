-- Add fallback INSERT policy for MasterAdmin on profiles table
-- This allows account recovery scenarios where a profile needs to be manually created
CREATE POLICY "MasterAdmin can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'MasterAdmin'));