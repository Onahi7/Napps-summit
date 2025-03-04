-- Create users in auth.users
DO $$
DECLARE
    admin_uid UUID;
    validator_uid UUID;
    participant1_uid UUID;
    participant2_uid UUID;
    superadmin_uid UUID;
BEGIN
    -- Create users with hashed passwords
    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data
    ) VALUES 
    (
        'admin@test.com',
        crypt('TestPassword123!', gen_salt('bf')),
        NOW(),
        '{"full_name":"Test Admin"}'::jsonb
    ) RETURNING id INTO admin_uid;

    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data
    ) VALUES 
    (
        'validator@test.com',
        crypt('TestPassword123!', gen_salt('bf')),
        NOW(),
        '{"full_name":"Test Validator"}'::jsonb
    ) RETURNING id INTO validator_uid;

    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data
    ) VALUES 
    (
        'participant1@test.com',
        crypt('TestPassword123!', gen_salt('bf')),
        NOW(),
        '{"full_name":"Test Participant 1"}'::jsonb
    ) RETURNING id INTO participant1_uid;

    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data
    ) VALUES 
    (
        'participant2@test.com',
        crypt('TestPassword123!', gen_salt('bf')),
        NOW(),
        '{"full_name":"Test Participant 2"}'::jsonb
    ) RETURNING id INTO participant2_uid;

    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data
    ) VALUES 
    (
        'superadmin@test.com',
        crypt('TestPassword123!', gen_salt('bf')),
        NOW(),
        '{"full_name":"Test Superadmin"}'::jsonb
    ) RETURNING id INTO superadmin_uid;

    -- Insert profiles with the correct user IDs
    INSERT INTO profiles (id, full_name, email, phone, state, role)
    VALUES
        (admin_uid, 'Test Admin', 'admin@test.com', '+2341234567890', 'Lagos', 'admin'),
        (validator_uid, 'Test Validator', 'validator@test.com', '+2341234567891', 'Abuja', 'validator'),
        (participant1_uid, 'Test Participant 1', 'participant1@test.com', '+2341234567892', 'Kano', 'participant'),
        (participant2_uid, 'Test Participant 2', 'participant2@test.com', '+2341234567893', 'Rivers', 'participant'),
        (superadmin_uid, 'Test Superadmin', 'superadmin@test.com', '+2341234567894', 'Lagos', 'superadmin');
END $$;

-- Insert test events
INSERT INTO events (id, title, start_date, end_date, location, description, price, organizer)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Main Conference', NOW() + INTERVAL '30 days', NOW() + INTERVAL '32 days', 'Lagos Conference Center', 'Annual education summit bringing together educators and administrators', 50000.00, 'Education Board'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Workshop Series', NOW() + INTERVAL '15 days', NOW() + INTERVAL '16 days', 'Abuja Training Center', 'Hands-on workshop for modern teaching methods', 25000.00, 'Teaching Association'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Leadership Seminar', NOW() + INTERVAL '45 days', NOW() + INTERVAL '46 days', 'Kano Educational Complex', 'Leadership development for education administrators', 35000.00, 'Leadership Institute')
ON CONFLICT (id) DO NOTHING;

-- Insert test registrations (we'll update these after inserting users)
DO $$
DECLARE
    participant1_id UUID;
    participant2_id UUID;
BEGIN
    SELECT id INTO participant1_id FROM profiles WHERE email = 'participant1@test.com';
    SELECT id INTO participant2_id FROM profiles WHERE email = 'participant2@test.com';

    INSERT INTO registrations (id, user_id, event_id, status)
    VALUES
        ('dddddddd-dddd-dddd-dddd-dddddddddddd', participant1_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'confirmed'),
        ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', participant1_id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pending'),
        ('ffffffff-ffff-ffff-ffff-ffffffffffff', participant2_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'confirmed');
END $$;

-- Insert test meal sessions
INSERT INTO meal_sessions (id, event_id, type, date, start_time, end_time)
VALUES
    ('11111111-2222-3333-4444-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'breakfast', NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days 8 hours', NOW() + INTERVAL '30 days 10 hours'),
    ('22222222-3333-4444-5555-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dinner', NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days 18 hours', NOW() + INTERVAL '30 days 20 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert test meal validations
DO $$
DECLARE
    validator_id UUID;
BEGIN
    SELECT id INTO validator_id FROM profiles WHERE email = 'validator@test.com';

    INSERT INTO meal_validations (id, registration_id, meal_session_id, validated_by)
    VALUES
        ('33333333-4444-5555-6666-777777777777', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-2222-3333-4444-555555555555', validator_id);
END $$;
