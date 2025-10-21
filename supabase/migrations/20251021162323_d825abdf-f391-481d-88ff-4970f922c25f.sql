-- Fix 1: Add INSERT and DELETE policies to profiles table
-- This fixes user registration blocking issues

CREATE POLICY "Service role can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow profile deletion" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id OR auth.uid() IS NULL);

-- Fix 2: Add authorization to auto_approve_spot function
-- This prevents users from bypassing AI moderation

CREATE OR REPLACE FUNCTION public.auto_approve_spot(spot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins or service role can call this
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can auto-approve spots';
  END IF;
  
  UPDATE public.fishing_spots
  SET status = 'approved', updated_at = now()
  WHERE id = spot_id AND status = 'pending';
END;
$$;