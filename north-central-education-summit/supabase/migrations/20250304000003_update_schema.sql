-- Update profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS chapter TEXT,
ADD COLUMN IF NOT EXISTS passport_url TEXT;

-- Update registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS registration_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS accredited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accredited_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS accredited_by UUID REFERENCES auth.users(id);

-- Create function to generate registration ID
CREATE OR REPLACE FUNCTION generate_registration_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.registration_id = 'NCES-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                       LPAD(CAST(floor(random() * 10000) AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate registration ID
CREATE TRIGGER set_registration_id
BEFORE INSERT ON registrations
FOR EACH ROW
EXECUTE FUNCTION generate_registration_id();

-- Update RLS policies
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Validators can update accreditation status"
ON registrations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'validator'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'validator'
  )
);

-- Create a table for role management history
CREATE TABLE IF NOT EXISTS public.role_management_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    previous_role user_role NOT NULL,
    new_role user_role NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on role management history
ALTER TABLE public.role_management_history ENABLE ROW LEVEL SECURITY;

-- Only superadmin can view role management history
CREATE POLICY "Only superadmin can view role history" ON public.role_management_history
    FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin');

-- Update profiles policies
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        (
            role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()) OR
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
        )
    );

-- Create a function to update user roles with history tracking
CREATE OR REPLACE FUNCTION update_user_role(
    target_user_id UUID,
    new_role user_role,
    reason TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
    -- Check if the current user is a superadmin
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'superadmin' THEN
        RAISE EXCEPTION 'Only superadmin can update roles';
    END IF;

    -- Get the current role and insert into history
    INSERT INTO public.role_management_history (
        user_id,
        previous_role,
        new_role,
        changed_by,
        reason
    )
    SELECT 
        target_user_id,
        role,
        new_role,
        auth.uid(),
        reason
    FROM public.profiles
    WHERE id = target_user_id;

    -- Update the role
    UPDATE public.profiles
    SET role = new_role,
        updated_at = now()
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
