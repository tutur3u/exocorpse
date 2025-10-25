-- Fix Portfolio RLS Policies
-- The issue: When soft-deleting (setting deleted_at), the SELECT policy prevents
-- viewing the updated row, causing the UPDATE to fail.
--
-- Solution: Allow authenticated users to see ALL rows (including deleted ones),
-- while keeping public users restricted to non-deleted rows only.

-- ============================================================================
-- DROP OLD POLICIES
-- ============================================================================

DROP POLICY IF EXISTS art_pieces_select_policy ON art_pieces;
DROP POLICY IF EXISTS writing_pieces_select_policy ON writing_pieces;

-- ============================================================================
-- CREATE NEW SELECT POLICIES
-- ============================================================================

-- Public users can only see non-deleted items
CREATE POLICY art_pieces_public_select_policy ON art_pieces
  FOR SELECT
  TO anon
  USING (deleted_at IS NULL);

CREATE POLICY writing_pieces_public_select_policy ON writing_pieces
  FOR SELECT
  TO anon
  USING (deleted_at IS NULL);

-- Authenticated users can see ALL items (including deleted ones)
CREATE POLICY art_pieces_auth_select_policy ON art_pieces
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY writing_pieces_auth_select_policy ON writing_pieces
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY art_pieces_public_select_policy ON art_pieces IS
  'Public users can only view non-deleted art pieces';
COMMENT ON POLICY art_pieces_auth_select_policy ON art_pieces IS
  'Authenticated users can view all art pieces including soft-deleted ones';

COMMENT ON POLICY writing_pieces_public_select_policy ON writing_pieces IS
  'Public users can only view non-deleted writing pieces';
COMMENT ON POLICY writing_pieces_auth_select_policy ON writing_pieces IS
  'Authenticated users can view all writing pieces including soft-deleted ones';
