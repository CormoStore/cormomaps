-- Drop existing foreign key constraint
ALTER TABLE public.fishing_posts
DROP CONSTRAINT fishing_posts_user_id_fkey;

-- Add new foreign key constraint that references profiles
ALTER TABLE public.fishing_posts
ADD CONSTRAINT fishing_posts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;