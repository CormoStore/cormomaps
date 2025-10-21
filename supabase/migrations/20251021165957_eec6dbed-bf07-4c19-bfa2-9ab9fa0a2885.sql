-- Fix function search path for security
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
DROP FUNCTION IF EXISTS public.update_reviews_updated_at();

CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_reviews_updated_at();