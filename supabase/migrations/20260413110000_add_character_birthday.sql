drop view if exists "public"."character_details";

alter table "public"."characters"
add column "birthday" date;

create view "public"."character_details" as
select
  c.id,
  c.name,
  c.slug,
  c.nickname,
  c.age,
  c.birthday,
  c.species,
  c.gender,
  c.pronouns,
  c.abilities,
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
  c.profile_image,
  c.banner_image,
  c.created_at,
  c.updated_at,
  c.deleted_at,
  c.created_by,
  c.quote,
  c.featured_image,
  c.description,
  c.fanwork_policy,
  c.color_palette,
  c.spotify_link,
  c.theme_primary_color,
  c.theme_secondary_color,
  c.theme_text_color,
  json_agg(distinct jsonb_build_object('world_id', cw.world_id)) filter (
    where cw.world_id is not null
  ) as world_ids,
  json_agg(
    distinct jsonb_build_object(
      'faction_id',
      f.id,
      'faction_name',
      f.name,
      'role',
      cf.role,
      'rank',
      cf.rank,
      'is_current',
      cf.is_current
    )
  ) filter (
    where f.id is not null
  ) as factions
from (((characters c
  left join character_worlds cw on (c.id = cw.character_id))
  left join character_factions cf on (c.id = cf.character_id))
  left join factions f on (cf.faction_id = f.id))
where (c.deleted_at is null)
group by c.id;
