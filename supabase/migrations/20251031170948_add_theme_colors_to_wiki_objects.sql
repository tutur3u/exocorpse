-- Add theme color columns to characters table
ALTER TABLE characters
ADD COLUMN IF NOT EXISTS theme_primary_color TEXT,
ADD COLUMN IF NOT EXISTS theme_secondary_color TEXT;

-- Add theme color columns to factions table
ALTER TABLE factions
ADD COLUMN IF NOT EXISTS theme_primary_color TEXT,
ADD COLUMN IF NOT EXISTS theme_secondary_color TEXT;

-- Add comments for documentation
COMMENT ON COLUMN characters.theme_primary_color IS 'Primary theme color for character styling (hex format)';
COMMENT ON COLUMN characters.theme_secondary_color IS 'Secondary theme color for character styling (hex format)';
COMMENT ON COLUMN factions.theme_primary_color IS 'Primary theme color for faction styling (hex format)';
COMMENT ON COLUMN factions.theme_secondary_color IS 'Secondary theme color for faction styling (hex format)';

