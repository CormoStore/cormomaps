-- Update handle_new_user function to create username from email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  -- Get username from metadata or generate from email
  IF NEW.raw_user_meta_data->>'username' IS NOT NULL THEN
    base_username := NEW.raw_user_meta_data->>'username';
  ELSE
    -- Extract username from email (part before @)
    base_username := split_part(NEW.email, '@', 1);
    -- Remove special characters and limit length
    base_username := regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g');
    base_username := substring(base_username, 1, 15);
  END IF;
  
  -- Ensure username is unique
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    final_username
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;