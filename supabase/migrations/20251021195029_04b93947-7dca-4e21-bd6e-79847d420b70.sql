-- Create marketplace listings table
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active' OR auth.uid() = user_id);

-- Users can create their own listings
CREATE POLICY "Users can create their own listings"
ON public.marketplace_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update their own listings"
ON public.marketplace_listings
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings"
ON public.marketplace_listings
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for marketplace images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('marketplace-images', 'marketplace-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view marketplace images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'marketplace-images');

CREATE POLICY "Users can upload their own marketplace images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own marketplace images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own marketplace images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);