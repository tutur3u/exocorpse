drop view if exists "public"."character_details";


alter table "public"."characters" drop column "fears";
alter table "public"."characters" drop column "goals";
alter table "public"."characters" drop column "likes";
alter table "public"."characters" drop column "dislikes";

-- Recreate character_details view with updated logic
CREATE VIEW character_details AS
SELECT c.id,
    c.name,
    c.slug,
    c.nickname,
    c.title,
    c.age,
    c.age_description,
    c.species,
    c.gender,
    c.pronouns,
    c.height,
    c.weight,
    c.build,
    c.hair_color,
    c.eye_color,
    c.skin_tone,
    c.distinguishing_features,
    c.status,
    c.occupation,
    c.personality_summary,
    c.backstory,
    c.lore,
    c.skills,
    c.abilities,
    c.strengths,
    c.weaknesses,
    c.profile_image,
    c.banner_image,
    c.color_scheme,
    c.created_at,
    c.updated_at,
    c.deleted_at,
    c.created_by,
    c.quote,
    c.featured_image,
    c.description,
    json_agg(DISTINCT jsonb_build_object('world_id', cw.world_id)) FILTER (WHERE cw.world_id IS NOT NULL) AS world_ids,
    json_agg(DISTINCT jsonb_build_object('faction_id', f.id, 'faction_name', f.name, 'role', cf.role, 'rank', cf.rank, 'is_current', cf.is_current)) FILTER (WHERE f.id IS NOT NULL) AS factions
  FROM (((characters c
    LEFT JOIN character_worlds cw ON (c.id = cw.character_id))
    LEFT JOIN character_factions cf ON (c.id = cf.character_id))
    LEFT JOIN factions f ON (cf.faction_id = f.id))
  WHERE (c.deleted_at IS NULL)
  GROUP BY c.id;