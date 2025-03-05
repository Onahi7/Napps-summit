-- Create payment_configurations table
CREATE TABLE IF NOT EXISTS payment_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    test_mode BOOLEAN DEFAULT true,
    public_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT unique_active_provider UNIQUE (provider, is_active)
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    registration_id UUID REFERENCES registrations(id),
    reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    provider_reference VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_refunds table
CREATE TABLE IF NOT EXISTS payment_refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES payment_transactions(id),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    refund_reference VARCHAR(100) UNIQUE NOT NULL,
    provider_reference VARCHAR(100),
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_disputes table
CREATE TABLE IF NOT EXISTS payment_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES payment_transactions(id),
    user_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'open',
    reason TEXT NOT NULL,
    resolution TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE payment_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Allow admins full access to payment_configurations"
    ON payment_configurations
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    ));

CREATE POLICY "Allow admins full access to payment_transactions"
    ON payment_transactions
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    ));

CREATE POLICY "Allow admins full access to payment_refunds"
    ON payment_refunds
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    ));

CREATE POLICY "Allow admins full access to payment_disputes"
    ON payment_disputes
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    ));

-- User policies
CREATE POLICY "Allow users to view their own transactions"
    ON payment_transactions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow users to view their own refunds"
    ON payment_refunds
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM payment_transactions
        WHERE payment_transactions.id = payment_refunds.transaction_id
        AND payment_transactions.user_id = auth.uid()
    ));

CREATE POLICY "Allow users to view and create their own disputes"
    ON payment_disputes
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_configurations_updated_at
    BEFORE UPDATE ON payment_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_refunds_updated_at
    BEFORE UPDATE ON payment_refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_disputes_updated_at
    BEFORE UPDATE ON payment_disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
