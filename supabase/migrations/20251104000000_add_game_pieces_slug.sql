-- Add slug column to game_pieces table
ALTER TABLE game_pieces
ADD COLUMN slug VARCHAR(255) UNIQUE;

-- Add an index on the slug column for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_pieces_slug ON game_pieces(slug);

-- Update existing records to have a slug based on their title
-- This is a one-time operation for existing data
UPDATE game_pieces
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing records
ALTER TABLE game_pieces
ALTER COLUMN slug SET NOT NULL;

