-- Create configurations table
CREATE TABLE configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage configurations"
    ON configurations FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    ));

CREATE POLICY "Public can view public configurations"
    ON configurations FOR SELECT
    USING (is_public = true);

-- Insert default configurations
INSERT INTO configurations (key, value, description, category, is_public) VALUES
    ('registration_fee', '5000', 'Default registration fee for events', 'payments', true),
    ('max_participants', '200', 'Maximum number of participants per event', 'events', true),
    ('meal_times', '{"breakfast": "07:00-09:00", "lunch": "12:00-14:00", "dinner": "18:00-20:00"}', 'Meal serving times', 'meals', true),
    ('validation_window', '15', 'Time window in minutes for meal validation', 'validation', false),
    ('payment_gateway', 'paystack', 'Active payment gateway', 'payments', false),
    ('email_templates', '{"welcome": "Welcome to the summit!", "registration": "Thank you for registering"}', 'Email notification templates', 'notifications', false);
