-- Is mutual flag now determined by the relationship type
ALTER TABLE character_relationships
DROP COLUMN IF EXISTS is_mutual;




