-- Add cover image fields to writing_pieces table
ALTER TABLE writing_pieces
  ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500),
  ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_writing_pieces_cover_image
  ON writing_pieces(cover_image)
  WHERE deleted_at IS NULL AND cover_image IS NOT NULL;

-- Add comment to document the columns
COMMENT ON COLUMN writing_pieces.cover_image IS 'URL or storage path to the cover image for this writing piece';
COMMENT ON COLUMN writing_pieces.thumbnail_url IS 'URL or storage path to a thumbnail version of the cover image';
