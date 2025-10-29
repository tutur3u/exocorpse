ALTER TABLE services
    ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(512);

-- Safely add slug to styles: add nullable, backfill, then enforce NOT NULL + UNIQUE
ALTER TABLE styles
    ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Backfill missing slugs using a slugified name, ensuring global uniqueness
WITH to_fill AS (
    SELECT
        style_id,
        LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) AS base_slug
    FROM styles
    WHERE slug IS NULL OR slug = ''
), ranked AS (
    SELECT
        style_id,
        base_slug,
        ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY style_id) AS rn
    FROM to_fill
)
UPDATE styles s
SET slug = CASE WHEN r.rn = 1 THEN r.base_slug ELSE r.base_slug || '-' || r.rn END
FROM ranked r
WHERE s.style_id = r.style_id AND (s.slug IS NULL OR s.slug = '');

-- Enforce NOT NULL
ALTER TABLE styles
    ALTER COLUMN slug SET NOT NULL;

-- Ensure a unique index exists on styles.slug
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_styles_slug_unique'
    ) THEN
        CREATE UNIQUE INDEX idx_styles_slug_unique ON styles (slug);
    END IF;
END
$$;