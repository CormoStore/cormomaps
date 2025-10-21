-- Create fishing equipment table
CREATE TABLE public.fishing_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('carpe', 'coup', 'feeder', 'leurre', 'mouche', 'truite', 'carnassier')),
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fishing_equipment ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own equipment" 
ON public.fishing_equipment 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own equipment" 
ON public.fishing_equipment 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equipment" 
ON public.fishing_equipment 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own equipment" 
ON public.fishing_equipment 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fishing_equipment_updated_at
BEFORE UPDATE ON public.fishing_equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();