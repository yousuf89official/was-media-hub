-- First, handle any duplicate emails by keeping the most recent profile
DELETE FROM profiles p1
USING profiles p2
WHERE p1.email = p2.email 
  AND p1.created_at < p2.created_at;

-- Drop and recreate the email unique constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_unique;
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Fix the handle_new_user() trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Insert profile with conflict handling on ID (primary key)
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    updated_at = NOW();
  
  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Assign MasterAdmin role to first user, Account role to others
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'MasterAdmin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'Account')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;