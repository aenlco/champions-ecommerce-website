-- Add is_admin to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add square_catalog_id to products table for sync tracking
ALTER TABLE products ADD COLUMN IF NOT EXISTS square_catalog_id TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS square_variation_data JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Add square_variation_id to product_variants
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS square_variation_id TEXT UNIQUE;

-- Homepage entries table (replaces hardcoded ENTRIES in HomeNew.tsx)
CREATE TABLE IF NOT EXISTS homepage_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'image', 'article', 'link')),
    media_url TEXT,
    description TEXT,
    external_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on homepage_entries
ALTER TABLE homepage_entries ENABLE ROW LEVEL SECURITY;

-- Public read access for homepage entries
CREATE POLICY "Public can read active entries" ON homepage_entries
    FOR SELECT USING (is_active = true);

-- Admins can manage entries
CREATE POLICY "Admins can manage entries" ON homepage_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Create storage buckets for homepage media
INSERT INTO storage.buckets (id, name, public) VALUES ('homepage-images', 'homepage-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('homepage-music', 'homepage-music', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, admin write
CREATE POLICY "Public can read homepage images" ON storage.objects
    FOR SELECT USING (bucket_id = 'homepage-images');

CREATE POLICY "Admins can upload homepage images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'homepage-images'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can delete homepage images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'homepage-images'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Public can read homepage music" ON storage.objects
    FOR SELECT USING (bucket_id = 'homepage-music');

CREATE POLICY "Admins can upload homepage music" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'homepage-music'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can delete homepage music" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'homepage-music'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Index for faster homepage entry queries
CREATE INDEX IF NOT EXISTS idx_homepage_entries_active ON homepage_entries (is_active, sort_order);
