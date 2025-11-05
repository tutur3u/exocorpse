-- ============================================================================
-- MODIFIED GET_CHARACTER_RELATIONSHIPS FUNCTION (Includes all B-side relationships)
-- ============================================================================

DROP FUNCTION IF EXISTS get_character_relationships(UUID);

CREATE OR REPLACE FUNCTION get_character_relationships(character_uuid UUID)
RETURNS TABLE (
  -- Relationship metadata
  id UUID,
  relationship_id UUID,
  description TEXT,
  
  -- Related character details
  related_character jsonb,
  
  -- Relationship type details
  relationship_type jsonb
) AS $$
BEGIN
  RETURN QUERY
  -- Forward relationships (where the character is character_a)
  SELECT
    cr.id AS id,
    cr.id AS relationship_id,
    cr.description,
    
    -- Related character (character_b) as JSONB
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'slug', c.slug,
      'nickname', c.nickname,
      'title', c.title,
      'age', c.age,
      'species', c.species,
      'gender', c.gender,
      'pronouns', c.pronouns,
      'status', c.status,
      'occupation', c.occupation,
      'profile_image', c.profile_image,
      'personality_summary', c.personality_summary
    ) AS related_character,
    
    -- Relationship type as JSONB (simplified schema)
    jsonb_build_object(
      'id', rt.id,
      'name', rt.name,
      'description', rt.description,
      'is_mutual', rt.is_mutual,
      'reverse_name', rt.reverse_name
    ) AS relationship_type
    
  FROM character_relationships cr
  JOIN characters c ON cr.character_b_id = c.id
  LEFT JOIN relationship_types rt ON cr.relationship_type_id = rt.id
  WHERE cr.character_a_id = character_uuid
    AND c.deleted_at IS NULL

  UNION ALL

  -- Reverse relationships (where the character is character_b, now includes non-mutual)
  SELECT
    cr.id AS id,
    cr.id AS relationship_id,
    cr.description,
    
    -- Related character (character_a) as JSONB
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'slug', c.slug,
      'nickname', c.nickname,
      'title', c.title,
      'age', c.age,
      'species', c.species,
      'gender', c.gender,
      'pronouns', c.pronouns,
      'status', c.status,
      'occupation', c.occupation,
      'profile_image', c.profile_image,
      'personality_summary', c.personality_summary
    ) AS related_character,
    
    -- Relationship type as JSONB (uses reverse name if defined)
    jsonb_build_object(
      'id', rt.id,
      'name', COALESCE(rt.reverse_name, rt.name),
      'description', rt.description,
      'is_mutual', rt.is_mutual,
      'reverse_name', rt.name
    ) AS relationship_type
    
  FROM character_relationships cr
  JOIN characters c ON cr.character_a_id = c.id
  LEFT JOIN relationship_types rt ON cr.relationship_type_id = rt.id
  WHERE cr.character_b_id = character_uuid -- **Condition for mutuality has been removed**
    AND c.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update comment to reflect the change
COMMENT ON FUNCTION get_character_relationships(UUID) IS 
'Returns all relationships for a character with full character details and relationship type info as JSONB objects. Includes both forward relationships and ALL reverse relationships (mutual or not).';