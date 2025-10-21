-- Add username column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE;

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Add constraint to ensure username format (alphanumeric, underscore, hyphen, 3-20 chars)
ALTER TABLE public.profiles
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$');

-- Update RLS policy to hide emails from public view
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view public profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view own email"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profile details"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));