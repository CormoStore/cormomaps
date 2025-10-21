-- Create fishing_posts table for Instagram-style feed
CREATE TABLE public.fishing_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  caption TEXT,
  fish_species TEXT,
  weight TEXT,
  length TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fishing_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view all posts
CREATE POLICY "Anyone can view all posts" 
ON public.fishing_posts 
FOR SELECT 
USING (true);

-- Users can create their own posts
CREATE POLICY "Users can create their own posts" 
ON public.fishing_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" 
ON public.fishing_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts" 
ON public.fishing_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_fishing_posts_updated_at
BEFORE UPDATE ON public.fishing_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();