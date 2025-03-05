-- Create payment_configurations table
CREATE TABLE IF NOT EXISTS public.payment_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    early_bird_fee DECIMAL(10, 2),
    early_bird_deadline TIMESTAMP WITH TIME ZONE,
    split_code TEXT,
    split_percentage INTEGER CHECK (split_percentage >= 0 AND split_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on payment_configurations
ALTER TABLE public.payment_configurations ENABLE ROW LEVEL SECURITY;

-- Only admins can view payment configurations
CREATE POLICY "Admins can view payment configurations" ON public.payment_configurations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- Only admins can update payment configurations
CREATE POLICY "Admins can update payment configurations" ON public.payment_configurations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- Add payment_split_code to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS payment_split_code TEXT,
ADD COLUMN IF NOT EXISTS split_percentage INTEGER;
