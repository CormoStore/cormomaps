-- Create a function to auto-approve spots (bypasses RLS)
CREATE OR REPLACE FUNCTION public.auto_approve_spot(spot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.fishing_spots
  SET status = 'approved', updated_at = now()
  WHERE id = spot_id AND status = 'pending';
END;
$$;