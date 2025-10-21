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

-- Recreate story_hierarchy view with optimized aggregation
CREATE VIEW story_hierarchy AS
WITH world_aggregates AS (
  SELECT
    w.id AS world_id,
    COALESCE(char_counts.character_count, 0) AS character_count,
    COALESCE(fac_counts.faction_count, 0) AS faction_count,
    COALESCE(loc_counts.location_count, 0) AS location_count,
    COALESCE(evt_counts.event_count, 0) AS event_count
  FROM worlds w
  LEFT JOIN (
    SELECT cw.world_id, COUNT(*) AS character_count
    FROM characters c
    INNER JOIN character_worlds cw ON c.id = cw.character_id
    WHERE c.deleted_at IS NULL
    GROUP BY cw.world_id
  ) char_counts ON w.id = char_counts.world_id
  LEFT JOIN (
    SELECT world_id, COUNT(*) AS faction_count
    FROM factions
    WHERE deleted_at IS NULL
    GROUP BY world_id
  ) fac_counts ON w.id = fac_counts.world_id
  LEFT JOIN (
    SELECT world_id, COUNT(*) AS location_count
    FROM locations
    WHERE deleted_at IS NULL
    GROUP BY world_id
  ) loc_counts ON w.id = loc_counts.world_id
  LEFT JOIN (
    SELECT world_id, COUNT(*) AS event_count
    FROM events
    WHERE deleted_at IS NULL
    GROUP BY world_id
  ) evt_counts ON w.id = evt_counts.world_id
  WHERE w.deleted_at IS NULL
)
SELECT s.id AS story_id,
    s.title AS story_title,
    s.slug AS story_slug,
    s.is_published,
    s.visibility,
    json_agg(jsonb_build_object('world_id', w.id, 'world_name', w.name, 'world_slug', w.slug, 'character_count', COALESCE(wa.character_count, 0), 'faction_count', COALESCE(wa.faction_count, 0), 'location_count', COALESCE(wa.location_count, 0), 'event_count', COALESCE(wa.event_count, 0))) FILTER (WHERE (w.id IS NOT NULL)) AS worlds
   FROM (stories s
     LEFT JOIN worlds w ON (((s.id = w.story_id) AND (w.deleted_at IS NULL)))
     LEFT JOIN world_aggregates wa ON (w.id = wa.world_id))
  WHERE (s.deleted_at IS NULL)
  GROUP BY s.id;


create function update_character_worlds(p_character_id uuid, p_world_ids uuid[])
returns table(success boolean, message text, updated_count int) as $$
declare
  v_deleted_count int;
  v_inserted_count int;
  v_error_message text;
  v_world_ids uuid[];
begin
  begin
    -- Delete existing character world associations
    delete from public.character_worlds where character_id = p_character_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    v_inserted_count := 0;

    -- Normalize inputs: remove nulls and duplicates
    v_world_ids := (select coalesce(array_agg(DISTINCT x), '{}') from unnest(coalesce(p_world_ids,'{}'::uuid[])) as t(x));

    -- Insert new associations if any worlds are provided
    if array_length(v_world_ids, 1) > 0 then
      insert into public.character_worlds (character_id, world_id)
      select p_character_id, unnest(v_world_ids);
      GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
    end if;

    -- Return success with operation details
    return query select true,
      format('Updated character worlds: removed %s, added %s.', v_deleted_count, v_inserted_count),
      v_inserted_count;
  exception when others then
    v_error_message := SQLERRM;
    return query select false, v_error_message, 0;
  end;
end;
$$ language plpgsql security invoker;