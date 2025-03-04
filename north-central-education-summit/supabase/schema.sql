-- Create schema for auth
CREATE SCHEMA IF NOT EXISTS auth;

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'validation_team', 'participant');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'participant'::user_role NOT NULL,
    phone_number TEXT,
    organization TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create events table
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    capacity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events
CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert events" ON public.events
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update events" ON public.events
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete events" ON public.events
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create registrations table
CREATE TABLE public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, event_id)
);

-- Enable Row Level Security on registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for registrations
CREATE POLICY "Users can view their own registrations" ON public.registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations" ON public.registrations
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert their own registrations" ON public.registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update registrations" ON public.registrations
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Create payments table
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'NGN' NOT NULL,
    payment_reference TEXT UNIQUE NOT NULL,
    payment_status TEXT DEFAULT 'pending' NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.registrations WHERE id = payments.registration_id
        )
    );

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can insert payments" ON public.payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON public.payments
    FOR UPDATE USING (true);

-- Create meals table
CREATE TABLE public.meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    meal_date TIMESTAMP WITH TIME ZONE NOT NULL,
    meal_type TEXT NOT NULL, -- breakfast, lunch, dinner
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on meals
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meals
CREATE POLICY "Meals are viewable by everyone" ON public.meals
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert meals" ON public.meals
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update meals" ON public.meals
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete meals" ON public.meals
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create meal_validations table
CREATE TABLE public.meal_validations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    validation_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    validator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(meal_id, user_id)
);

-- Enable Row Level Security on meal_validations
ALTER TABLE public.meal_validations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meal_validations
CREATE POLICY "Users can view their own meal validations" ON public.meal_validations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all meal validations" ON public.meal_validations
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Validation team can view all meal validations" ON public.meal_validations
    FOR SELECT USING (auth.jwt() ->> 'role' = 'validation_team');

CREATE POLICY "Validation team can insert meal validations" ON public.meal_validations
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'validation_team');

-- Create resources table
CREATE TABLE public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- speaker, hall, material
    description TEXT,
    capacity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resources
CREATE POLICY "Resources are viewable by everyone" ON public.resources
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert resources" ON public.resources
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update resources" ON public.resources
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete resources" ON public.resources
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create schedules table
CREATE TABLE public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for schedules
CREATE POLICY "Schedules are viewable by everyone" ON public.schedules
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert schedules" ON public.schedules
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update schedules" ON public.schedules
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete schedules" ON public.schedules
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create functions for user management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        'participant'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user profile
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET
        email = NEW.email,
        updated_at = now()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user update
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
