-- Create storage bucket for fishing posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('fishing-posts', 'fishing-posts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for fishing posts
CREATE POLICY "Anyone can view fishing post images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'fishing-posts');

CREATE POLICY "Users can upload their own fishing post images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'fishing-posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own fishing post images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'fishing-posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own fishing post images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'fishing-posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);