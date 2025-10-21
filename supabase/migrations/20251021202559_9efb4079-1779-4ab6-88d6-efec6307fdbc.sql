-- Create fishing_licenses table to store user fishing permits
CREATE TABLE public.fishing_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL,
  license_type TEXT NOT NULL, -- 'daily', 'annual', 'reciprocal', etc.
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issuing_organization TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, license_number)
);

-- Enable Row Level Security
ALTER TABLE public.fishing_licenses ENABLE ROW LEVEL SECURITY;

-- Users can view their own licenses
CREATE POLICY "Users can view their own licenses"
ON public.fishing_licenses
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own licenses
CREATE POLICY "Users can create their own licenses"
ON public.fishing_licenses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own licenses
CREATE POLICY "Users can update their own licenses"
ON public.fishing_licenses
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own licenses
CREATE POLICY "Users can delete their own licenses"
ON public.fishing_licenses
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all licenses
CREATE POLICY "Admins can view all licenses"
ON public.fishing_licenses
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_fishing_licenses_updated_at
BEFORE UPDATE ON public.fishing_licenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();