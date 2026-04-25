-- Ensure newsletter_subscribers table exists with the shape the app expects
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies — without these, anonymous visitors can't write from the gate
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update their subscription" ON newsletter_subscribers;
CREATE POLICY "Anyone can update their subscription" ON newsletter_subscribers
    FOR UPDATE TO anon, authenticated
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can read subscribers" ON newsletter_subscribers
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at
    ON newsletter_subscribers (created_at DESC);
