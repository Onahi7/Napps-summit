-- Create meal_sessions table
CREATE TABLE meal_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    type TEXT CHECK (type IN ('breakfast', 'dinner')),
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meal_validations table
CREATE TABLE meal_validations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id),
    meal_session_id UUID REFERENCES meal_sessions(id),
    validated_by UUID REFERENCES auth.users(id),
    validated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(registration_id, meal_session_id)
);

-- Add RLS policies
ALTER TABLE meal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_validations ENABLE ROW LEVEL SECURITY;

-- Policies for meal_sessions
CREATE POLICY "Meal sessions are viewable by authenticated users"
ON meal_sessions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert meal sessions"
ON meal_sessions FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policies for meal_validations
CREATE POLICY "Validators can view meal validations"
ON meal_validations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'validator' OR profiles.role = 'admin')
    )
);

CREATE POLICY "Validators can create meal validations"
ON meal_validations FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'validator'
    )
);
