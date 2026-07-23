-- Per-variant image URL, populated from Square variation image_ids during catalog sync.
-- Lets the View Item gallery swap the hero image when a size/variation is selected.
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS image TEXT;
