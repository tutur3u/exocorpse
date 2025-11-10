set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_character_relationships(character_uuid uuid)
 RETURNS TABLE(id uuid, relationship_id uuid, description text, related_character jsonb, relationship_type jsonb)
 LANGUAGE plpgsql
 STABLE
AS $function$BEGIN
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
END;$function$
;


