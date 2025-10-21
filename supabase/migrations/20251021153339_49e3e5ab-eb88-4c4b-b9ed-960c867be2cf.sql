-- Add status column to fishing_spots table
ALTER TABLE public.fishing_spots 
ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing spots to be approved
UPDATE public.fishing_spots SET status = 'approved';

-- Drop existing RLS policies for fishing_spots
DROP POLICY IF EXISTS "Everyone can view fishing spots" ON public.fishing_spots;
DROP POLICY IF EXISTS "Authenticated users can create spots" ON public.fishing_spots;
DROP POLICY IF EXISTS "Users can update their own spots" ON public.fishing_spots;
DROP POLICY IF EXISTS "Users can delete their own spots" ON public.fishing_spots;
DROP POLICY IF EXISTS "Admins can delete any spot" ON public.fishing_spots;

-- Create new RLS policies with status-based access
-- Users can view approved spots and their own spots regardless of status
CREATE POLICY "Users can view approved spots and own spots"
ON public.fishing_spots
FOR SELECT
USING (
  status = 'approved' 
  OR auth.uid() = created_by
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Authenticated users can create spots (will be pending by default)
CREATE POLICY "Authenticated users can create spots"
ON public.fishing_spots
FOR INSERT
WITH CHECK (auth.uid() = created_by AND status = 'pending');

-- Users can update their own pending spots
CREATE POLICY "Users can update their own spots"
ON public.fishing_spots
FOR UPDATE
USING (auth.uid() = created_by AND status = 'pending');

-- Admins can update any spot (including status)
CREATE POLICY "Admins can update any spot"
ON public.fishing_spots
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can delete their own spots
CREATE POLICY "Users can delete their own spots"
ON public.fishing_spots
FOR DELETE
USING (auth.uid() = created_by);

-- Admins can delete any spot
CREATE POLICY "Admins can delete any spot"
ON public.fishing_spots
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));