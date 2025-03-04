-- Add tag-related columns to registrations table
ALTER TABLE registrations
ADD COLUMN tag_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN tag_url TEXT;

-- Create storage bucket for tags if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('tags', 'tags', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for tags bucket
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'tags');

CREATE POLICY "Allow admin full access"
ON storage.objects FOR ALL
USING (
  bucket_id = 'tags' AND
  (SELECT p.role FROM auth.users u JOIN public.profiles p ON u.id = p.id WHERE u.id = auth.uid()) = 'admin'
);

-- Function to check if a registration's tag has been generated
CREATE OR REPLACE FUNCTION public.check_tag_generated(registration_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'tags'
    AND name LIKE registration_id || '.png'
  );
END;
$$;
