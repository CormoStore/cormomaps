-- Add policy to allow all authenticated users to view equipment
CREATE POLICY "Anyone can view equipment" 
ON public.fishing_equipment 
FOR SELECT 
USING (true);