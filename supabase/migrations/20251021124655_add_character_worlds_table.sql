-- Drop dependent views
DROP VIEW IF EXISTS story_hierarchy CASCADE;
DROP VIEW IF EXISTS character_details CASCADE;

-- Create the character_worlds junction table
CREATE TABLE character_worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(character_id, world_id)
);

-- Create index for better query performance
CREATE INDEX idx_character_worlds_character_id ON character_worlds(character_id);
CREATE INDEX idx_character_worlds_world_id ON character_worlds(world_id);

-- Migrate existing data from characters table where world_id is not null
INSERT INTO character_worlds (character_id, world_id, created_at)
SELECT id, world_id, created_at FROM characters WHERE world_id IS NOT NULL;

ALTER TABLE character_worlds enable ROW LEVEL SECURITY;

create policy "Enable delete for authenticated users"
on "public"."character_worlds"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."character_worlds"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."character_worlds"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."character_worlds"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Drop the world_id column from characters table
ALTER TABLE characters DROP COLUMN world_id;

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
    c.likes,
    c.dislikes,
    c.fears,
    c.goals,
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
    c.view_count,
    c.like_count,
    json_agg(DISTINCT jsonb_build_object('world_id', cw.world_id)) FILTER (WHERE cw.world_id IS NOT NULL) AS world_ids,
    json_agg(DISTINCT jsonb_build_object('faction_id', f.id, 'faction_name', f.name, 'role', cf.role, 'rank', cf.rank, 'is_current', cf.is_current)) FILTER (WHERE f.id IS NOT NULL) AS factions
  FROM (((characters c
    LEFT JOIN character_worlds cw ON (c.id = cw.character_id))
    LEFT JOIN character_factions cf ON (c.id = cf.character_id))
    LEFT JOIN factions f ON (cf.faction_id = f.id))
  WHERE (c.deleted_at IS NULL)
  GROUP BY c.id;

-- Recreate story_hierarchy view with updated logic
CREATE VIEW story_hierarchy AS
SELECT s.id AS story_id,
    s.title AS story_title,
    s.slug AS story_slug,
    s.is_published,
    s.visibility,
    json_agg(jsonb_build_object('world_id', w.id, 'world_name', w.name, 'world_slug', w.slug, 'character_count', ( SELECT count(*) AS count
           FROM characters c
           INNER JOIN character_worlds cw ON c.id = cw.character_id
          WHERE ((cw.world_id = w.id) AND (c.deleted_at IS NULL))), 'faction_count', ( SELECT count(*) AS count
           FROM factions
          WHERE ((factions.world_id = w.id) AND (factions.deleted_at IS NULL))), 'location_count', ( SELECT count(*) AS count
           FROM locations
          WHERE ((locations.world_id = w.id) AND (locations.deleted_at IS NULL))), 'event_count', ( SELECT count(*) AS count
           FROM events
          WHERE ((events.world_id = w.id) AND (events.deleted_at IS NULL))))) FILTER (WHERE (w.id IS NOT NULL)) AS worlds
   FROM (stories s
     LEFT JOIN worlds w ON (((s.id = w.story_id) AND (w.deleted_at IS NULL))))
  WHERE (s.deleted_at IS NULL)
  GROUP BY s.id;
