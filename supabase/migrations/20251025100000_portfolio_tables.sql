-- Portfolio Tables Migration
-- Creates tables for art_pieces and writing_pieces with support for:
-- - Tag filtering (original work, fanwork, commissioned work)
-- - Year/date filtering
-- - Featured/rotating gallery system
-- - Rich text descriptions (Markdown)
-- - Soft delete pattern

-- ============================================================================
-- ART PIECES TABLE
-- ============================================================================

CREATE TABLE art_pieces (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Year and date for filtering
  year INTEGER,
  created_date DATE,

  -- Tags for categorization (original, fanwork, commissioned, etc.)
  tags TEXT[],

  -- Featured system for rotating gallery
  is_featured BOOLEAN DEFAULT false,

  -- Display order
  display_order INTEGER DEFAULT 0,

  -- Artist information
  artist_name TEXT,
  artist_url TEXT,

  -- Timestamps and soft delete
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT art_pieces_year_check CHECK (year >= 1900 AND year <= 2100)
);

-- Indexes for art_pieces
CREATE INDEX idx_art_pieces_slug ON art_pieces(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_art_pieces_year ON art_pieces(year) WHERE deleted_at IS NULL;
CREATE INDEX idx_art_pieces_is_featured ON art_pieces(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_art_pieces_deleted_at ON art_pieces(deleted_at);
CREATE INDEX idx_art_pieces_display_order ON art_pieces(display_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_art_pieces_tags ON art_pieces USING GIN(tags) WHERE deleted_at IS NULL;

-- ============================================================================
-- WRITING PIECES TABLE
-- ============================================================================

CREATE TABLE writing_pieces (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,

  -- Year and date for filtering
  year INTEGER,
  created_date DATE,

  -- Tags for categorization (original, fanwork, commissioned, etc.)
  tags TEXT[],

  -- Featured system for rotating gallery
  is_featured BOOLEAN DEFAULT false,

  -- Display order
  display_order INTEGER DEFAULT 0,

  -- Word count (auto-calculated or manually set)
  word_count INTEGER,

  -- Timestamps and soft delete
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT writing_pieces_year_check CHECK (year >= 1900 AND year <= 2100),
  CONSTRAINT writing_pieces_word_count_check CHECK (word_count >= 0)
);

-- Indexes for writing_pieces
CREATE INDEX idx_writing_pieces_slug ON writing_pieces(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_writing_pieces_year ON writing_pieces(year) WHERE deleted_at IS NULL;
CREATE INDEX idx_writing_pieces_is_featured ON writing_pieces(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_writing_pieces_deleted_at ON writing_pieces(deleted_at);
CREATE INDEX idx_writing_pieces_display_order ON writing_pieces(display_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_writing_pieces_tags ON writing_pieces USING GIN(tags) WHERE deleted_at IS NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to automatically update updated_at for art_pieces
CREATE TRIGGER set_art_pieces_updated_at
BEFORE UPDATE ON art_pieces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at for writing_pieces
CREATE TRIGGER set_writing_pieces_updated_at
BEFORE UPDATE ON writing_pieces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE art_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_pieces ENABLE ROW LEVEL SECURITY;

-- Public read access (only non-deleted items)
CREATE POLICY art_pieces_select_policy ON art_pieces
  FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY writing_pieces_select_policy ON writing_pieces
  FOR SELECT
  USING (deleted_at IS NULL);

-- Authenticated users can insert/update/delete
CREATE POLICY art_pieces_insert_policy ON art_pieces
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY art_pieces_update_policy ON art_pieces
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY art_pieces_delete_policy ON art_pieces
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY writing_pieces_insert_policy ON writing_pieces
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY writing_pieces_update_policy ON writing_pieces
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY writing_pieces_delete_policy ON writing_pieces
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE art_pieces IS 'Portfolio artwork pieces with image URLs and metadata';
COMMENT ON TABLE writing_pieces IS 'Portfolio writing pieces with markdown content';

COMMENT ON COLUMN art_pieces.tags IS 'Array of tags like "original", "fanwork", "commissioned", etc.';
COMMENT ON COLUMN art_pieces.is_featured IS 'Whether this piece is featured in the rotating gallery';
COMMENT ON COLUMN art_pieces.display_order IS 'Order for displaying items (lower numbers first)';

COMMENT ON COLUMN writing_pieces.tags IS 'Array of tags like "original", "fanwork", "commissioned", etc.';
COMMENT ON COLUMN writing_pieces.is_featured IS 'Whether this piece is featured in the rotating gallery';
COMMENT ON COLUMN writing_pieces.display_order IS 'Order for displaying items (lower numbers first)';
COMMENT ON COLUMN writing_pieces.content IS 'Markdown content of the writing piece';
