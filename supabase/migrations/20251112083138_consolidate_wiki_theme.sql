drop view if exists "public"."character_details";

drop view if exists "public"."event_details";

drop view if exists "public"."story_hierarchy";

alter table "public"."characters" add column "theme_primary_color" text;
alter table "public"."characters" add constraint "characters_theme_primary_color_check" check ((theme_primary_color IS NULL) or (theme_primary_color ~ '^#[0-9A-Fa-f]{6}$'));

alter table "public"."characters" add column "theme_secondary_color" text;
alter table "public"."characters" add constraint "characters_theme_secondary_color_check" check ((theme_secondary_color IS NULL) or (theme_secondary_color ~ '^#[0-9A-Fa-f]{6}$'));

alter table "public"."characters" add column "theme_text_color" text;
alter table "public"."characters" add constraint "characters_theme_text_color_check" check ((theme_text_color IS NULL) or (theme_text_color ~ '^#[0-9A-Fa-f]{6}$'));

alter table "public"."factions" add column "theme_primary_color" text;
alter table "public"."factions" add constraint "factions_theme_primary_color_check" check ((theme_primary_color IS NULL) or (theme_primary_color ~ '^#[0-9A-Fa-f]{6}$'));

alter table "public"."factions" add column "theme_secondary_color" text;
alter table "public"."factions" add constraint "factions_theme_secondary_color_check" check ((theme_secondary_color IS NULL) or (theme_secondary_color ~ '^#[0-9A-Fa-f]{6}$'));

alter table "public"."factions" add column "theme_text_color" text;
alter table "public"."factions" add constraint "factions_theme_text_color_check" check ((theme_text_color IS NULL) or (theme_text_color ~ '^#[0-9A-Fa-f]{6}$'));

-- Migrate existing color_scheme data to new theme columns
UPDATE public.characters 
SET theme_primary_color = color_scheme 
WHERE color_scheme IS NOT NULL;

UPDATE public.factions 
SET theme_primary_color = color_scheme 
WHERE color_scheme IS NOT NULL;

alter table "public"."characters" drop column "color_scheme";

alter table "public"."factions" drop column "color_scheme";

alter table "public"."stories" drop column "like_count";

alter table "public"."stories" drop column "theme_background_color";

alter table "public"."stories" drop column "theme_custom_css";

alter table "public"."stories" drop column "view_count";

alter table "public"."worlds" add column "theme_text_color" text;

alter table "public"."worlds" add constraint "worlds_theme_text_color_check" check ((theme_text_color IS NULL) or (theme_text_color ~ '^#[0-9A-Fa-f]{6}$'));

alter table "public"."worlds" add constraint "worlds_theme_primary_color_check" check ((theme_primary_color IS NULL) or (theme_primary_color ~ '^#[0-9A-Fa-f]{6}$'));

alter table "public"."worlds" add constraint "worlds_theme_secondary_color_check" check ((theme_secondary_color IS NULL) or (theme_secondary_color ~ '^#[0-9A-Fa-f]{6}$'));


alter table "public"."worlds" drop column "theme_map_image";


create or replace view "public"."event_details" as  SELECT e.id,
    e.world_id,
    e.timeline_id,
    e.location_id,
    e.event_type_id,
    e.name,
    e.slug,
    e.summary,
    e.description,
    e.date,
    e.date_year,
    e.duration,
    e.significance,
    e.outcome,
    e.casualties,
    e.image_url,
    e.color,
    e.content,
    e.created_at,
    e.updated_at,
    e.deleted_at,
    e.created_by,
    w.name AS world_name,
    l.name AS location_name,
    json_agg(DISTINCT jsonb_build_object('character_id', c.id, 'character_name', c.name, 'role', ep.role)) FILTER (WHERE (c.id IS NOT NULL)) AS participants,
    json_agg(DISTINCT jsonb_build_object('faction_id', f.id, 'faction_name', f.name, 'role', ef.role)) FILTER (WHERE (f.id IS NOT NULL)) AS involved_factions
   FROM ((((((public.events e
     LEFT JOIN public.worlds w ON ((e.world_id = w.id)))
     LEFT JOIN public.locations l ON ((e.location_id = l.id)))
     LEFT JOIN public.event_participants ep ON ((e.id = ep.event_id)))
     LEFT JOIN public.characters c ON ((ep.character_id = c.id)))
     LEFT JOIN public.event_factions ef ON ((e.id = ef.event_id)))
     LEFT JOIN public.factions f ON ((ef.faction_id = f.id)))
  WHERE (e.deleted_at IS NULL)
  GROUP BY e.id, w.name, l.name;


create or replace view "public"."story_hierarchy" as  WITH world_aggregates AS (
         SELECT w_1.id AS world_id,
            COALESCE(char_counts.character_count, (0)::bigint) AS character_count,
            COALESCE(fac_counts.faction_count, (0)::bigint) AS faction_count,
            COALESCE(loc_counts.location_count, (0)::bigint) AS location_count,
            COALESCE(evt_counts.event_count, (0)::bigint) AS event_count
           FROM ((((public.worlds w_1
             LEFT JOIN ( SELECT cw.world_id,
                    count(*) AS character_count
                   FROM (public.characters c
                     JOIN public.character_worlds cw ON ((c.id = cw.character_id)))
                  WHERE (c.deleted_at IS NULL)
                  GROUP BY cw.world_id) char_counts ON ((w_1.id = char_counts.world_id)))
             LEFT JOIN ( SELECT factions.world_id,
                    count(*) AS faction_count
                   FROM public.factions
                  WHERE (factions.deleted_at IS NULL)
                  GROUP BY factions.world_id) fac_counts ON ((w_1.id = fac_counts.world_id)))
             LEFT JOIN ( SELECT locations.world_id,
                    count(*) AS location_count
                   FROM public.locations
                  WHERE (locations.deleted_at IS NULL)
                  GROUP BY locations.world_id) loc_counts ON ((w_1.id = loc_counts.world_id)))
             LEFT JOIN ( SELECT events.world_id,
                    count(*) AS event_count
                   FROM public.events
                  WHERE (events.deleted_at IS NULL)
                  GROUP BY events.world_id) evt_counts ON ((w_1.id = evt_counts.world_id)))
          WHERE (w_1.deleted_at IS NULL)
        )
 SELECT s.id AS story_id,
    s.title AS story_title,
    s.slug AS story_slug,
    s.is_published,
    s.visibility,
    json_agg(jsonb_build_object('world_id', w.id, 'world_name', w.name, 'world_slug', w.slug, 'character_count', COALESCE(wa.character_count, (0)::bigint), 'faction_count', COALESCE(wa.faction_count, (0)::bigint), 'location_count', COALESCE(wa.location_count, (0)::bigint), 'event_count', COALESCE(wa.event_count, (0)::bigint))) FILTER (WHERE (w.id IS NOT NULL)) AS worlds
   FROM ((public.stories s
     LEFT JOIN public.worlds w ON (((s.id = w.story_id) AND (w.deleted_at IS NULL))))
     LEFT JOIN world_aggregates wa ON ((w.id = wa.world_id)))
  WHERE (s.deleted_at IS NULL)
  GROUP BY s.id;


-- Recreate character_details view with updated logic
CREATE VIEW character_details AS
SELECT c.id,
    c.name,
    c.slug,
    c.nickname,
    c.age,
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
    json_agg(DISTINCT jsonb_build_object('world_id', cw.world_id)) FILTER (WHERE cw.world_id IS NOT NULL) AS world_ids,
    json_agg(DISTINCT jsonb_build_object('faction_id', f.id, 'faction_name', f.name, 'role', cf.role, 'rank', cf.rank, 'is_current', cf.is_current)) FILTER (WHERE f.id IS NOT NULL) AS factions
  FROM (((characters c
    LEFT JOIN character_worlds cw ON (c.id = cw.character_id))
    LEFT JOIN character_factions cf ON (c.id = cf.character_id))
    LEFT JOIN factions f ON (cf.faction_id = f.id))
  WHERE (c.deleted_at IS NULL)
  GROUP BY c.id;
