-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables and apply consistent policies:
-- - Public read access for all users
-- - Write access (insert, update, delete) for authenticated users only

-- ============================================================================
-- CUSTOMIZABLE TYPE TABLES
-- ============================================================================

alter table "public"."relationship_types" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."relationship_types"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."relationship_types"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."relationship_types"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."relationship_types"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Event types
alter table "public"."event_types" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."event_types"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."event_types"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."event_types"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."event_types"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Outfit types
alter table "public"."outfit_types" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."outfit_types"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."outfit_types"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."outfit_types"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."outfit_types"
as permissive
for update
to authenticated
using (true)
with check (true);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Stories
alter table "public"."stories" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."stories"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."stories"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."stories"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."stories"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Worlds
alter table "public"."worlds" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."worlds"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."worlds"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."worlds"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."worlds"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Factions
alter table "public"."factions" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."factions"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."factions"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."factions"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."factions"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Locations
alter table "public"."locations" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."locations"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."locations"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."locations"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."locations"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Characters
alter table "public"."characters" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."characters"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."characters"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."characters"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."characters"
as permissive
for update
to authenticated
using (true)
with check (true);

-- ============================================================================
-- CHARACTER-RELATED TABLES
-- ============================================================================

-- Character outfits
alter table "public"."character_outfits" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."character_outfits"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."character_outfits"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."character_outfits"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."character_outfits"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Character gallery
alter table "public"."character_gallery" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."character_gallery"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."character_gallery"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."character_gallery"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."character_gallery"
as permissive
for update
to authenticated
using (true)
with check (true);

-- ============================================================================
-- EVENT AND TIMELINE TABLES
-- ============================================================================

-- Timelines
alter table "public"."timelines" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."timelines"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."timelines"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."timelines"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."timelines"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Events
alter table "public"."events" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."events"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."events"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."events"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."events"
as permissive
for update
to authenticated
using (true)
with check (true);

-- ============================================================================
-- TAGGING AND MOODBOARD TABLES
-- ============================================================================

-- Tags
alter table "public"."tags" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."tags"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."tags"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."tags"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."tags"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Moodboards
alter table "public"."moodboards" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."moodboards"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."moodboards"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."moodboards"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."moodboards"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Media assets
alter table "public"."media_assets" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."media_assets"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."media_assets"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."media_assets"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."media_assets"
as permissive
for update
to authenticated
using (true)
with check (true);

-- ============================================================================
-- JUNCTION TABLES
-- ============================================================================

-- Character relationships
alter table "public"."character_relationships" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."character_relationships"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."character_relationships"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."character_relationships"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."character_relationships"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Character factions
alter table "public"."character_factions" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."character_factions"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."character_factions"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."character_factions"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."character_factions"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Event participants
alter table "public"."event_participants" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."event_participants"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."event_participants"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."event_participants"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."event_participants"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Event factions
alter table "public"."event_factions" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."event_factions"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."event_factions"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."event_factions"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."event_factions"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Entity tags
alter table "public"."entity_tags" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."entity_tags"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."entity_tags"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."entity_tags"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."entity_tags"
as permissive
for update
to authenticated
using (true)
with check (true);

-- Character locations
alter table "public"."character_locations" enable row level security;

create policy "Enable delete for authenticated users"
on "public"."character_locations"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."character_locations"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."character_locations"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."character_locations"
as permissive
for update
to authenticated
using (true)
with check (true);



