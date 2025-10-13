-- ============================================================================
-- EXOCORPSE FANTASY WIKI DATABASE SCHEMA
-- ============================================================================
-- A comprehensive database schema for managing story universes, worlds,
-- factions, locations, characters, events, and all associated media.
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Character status
CREATE TYPE character_status AS ENUM (
  'alive',
  'deceased',
  'unknown',
  'missing',
  'imprisoned'
);

-- Media asset types
CREATE TYPE media_type AS ENUM (
  'image',
  'video',
  'audio',
  'document',
  'model_3d',
  'other'
);

-- Visibility/privacy levels
CREATE TYPE visibility_level AS ENUM (
  'public',     -- Visible to everyone
  'unlisted',   -- Visible with link
  'private'     -- Only visible to owner
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Stories/Universes (top-level containers)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  summary TEXT, -- Short summary for listings

  -- Visual theming
  theme_primary_color TEXT, -- Hex color
  theme_secondary_color TEXT,
  theme_background_color TEXT,
  theme_text_color TEXT,
  theme_custom_css TEXT, -- Custom CSS for the story page
  theme_background_image TEXT, -- URL to background image

  -- Content
  content TEXT, -- Rich text/markdown content

  -- Status
  is_published BOOLEAN DEFAULT false,
  visibility visibility_level DEFAULT 'private',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Stats
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0
);

-- ============================================================================
-- CUSTOMIZABLE TYPE TABLES (must be after stories)
-- ============================================================================

-- Relationship types (customizable per story/world)
CREATE TABLE relationship_types (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE, -- NULL means global/default

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Categorization
  category TEXT, -- 'family', 'social', 'romantic', 'antagonistic', 'professional', etc.

  -- Visual
  color TEXT,
  icon TEXT,

  -- Directionality
  is_mutual BOOLEAN DEFAULT false, -- If true, relationship goes both ways
  reverse_name TEXT, -- e.g., "parent" <-> "child"

  -- Metadata
  is_default BOOLEAN DEFAULT false, -- Pre-defined types
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(story_id, slug)
);

-- Event types (customizable per story/world)
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE, -- NULL means global/default

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Visual
  color TEXT,
  icon TEXT,

  -- Metadata
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(story_id, slug)
);

-- Outfit types (customizable per story/world)
CREATE TABLE outfit_types (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE, -- NULL means global/default

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Visual
  color TEXT,
  icon TEXT,

  -- Metadata
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(story_id, slug)
);

-- ============================================================================
-- CORE TABLES (continued)
-- ============================================================================

-- Worlds within stories
CREATE TABLE worlds (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  summary TEXT,

  -- World characteristics
  world_type TEXT, -- planet, dimension, realm, etc.
  size TEXT, -- scale of the world
  population BIGINT,

  -- Visual theming (can override story theme)
  theme_primary_color TEXT,
  theme_secondary_color TEXT,
  theme_background_image TEXT,
  theme_map_image TEXT, -- World map

  -- Content
  content TEXT, -- Detailed lore

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(story_id, slug)
);

-- Factions/Organizations
CREATE TABLE factions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  parent_faction_id UUID REFERENCES factions(id) ON DELETE SET NULL,

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  summary TEXT,

  -- Faction details
  faction_type TEXT, -- corporation, government, guild, military, etc.
  founding_date TEXT, -- Can be flexible format
  status TEXT, -- active, defunct, hidden, etc.

  -- Characteristics
  primary_goal TEXT,
  ideology TEXT,
  reputation TEXT,
  power_level TEXT, -- local, regional, global, universal
  member_count INTEGER,

  -- Visual
  logo_url TEXT,
  color_scheme TEXT,
  banner_image TEXT,

  -- Content
  content TEXT, -- Detailed history and lore

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Locations within worlds
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  parent_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  summary TEXT,

  -- Location details
  location_type TEXT, -- continent, country, city, building, room, etc.
  climate TEXT,
  population BIGINT,

  -- Coordinates
  coordinate_x DECIMAL,
  coordinate_y DECIMAL,
  coordinate_z DECIMAL, -- For 3D maps
  map_image TEXT, -- Image of this location's map

  -- Visual
  image_url TEXT,
  banner_image TEXT,

  -- Content
  content TEXT, -- Detailed description

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(world_id, slug)
);

-- Characters (OCs)
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  nickname TEXT,
  title TEXT, -- Dr., Agent, Commander, etc.

  -- Demographics
  age INTEGER,
  age_description TEXT, -- "early 20s", "ancient", etc.
  species TEXT,
  gender TEXT,
  pronouns TEXT,

  -- Physical
  height TEXT,
  weight TEXT,
  build TEXT,
  hair_color TEXT,
  eye_color TEXT,
  skin_tone TEXT,
  distinguishing_features TEXT,

  -- Status
  status character_status DEFAULT 'alive',
  occupation TEXT,

  -- Personality
  personality_summary TEXT,
  likes TEXT,
  dislikes TEXT,
  fears TEXT,
  goals TEXT,

  -- Backstory
  backstory TEXT, -- Rich text/markdown
  lore TEXT, -- Additional lore

  -- Skills & abilities
  skills TEXT,
  abilities TEXT,
  strengths TEXT,
  weaknesses TEXT,

  -- Visual
  profile_image TEXT,
  banner_image TEXT,
  color_scheme TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),

  -- Stats
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0
);

-- Character outfits/costumes
CREATE TABLE character_outfits (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  outfit_type_id UUID REFERENCES outfit_types(id) ON DELETE SET NULL,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,

  -- Visual
  image_url TEXT,
  reference_images TEXT[], -- Array of URLs
  color_palette TEXT,

  -- Details
  notes TEXT,
  is_default BOOLEAN DEFAULT false,

  -- Metadata
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Character gallery (artwork)
CREATE TABLE character_gallery (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,

  -- Media
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Credits
  artist_name TEXT,
  artist_url TEXT,
  commission_date DATE,

  -- Tags
  tags TEXT[], -- Array of tags like "full body", "portrait", "action"

  -- Metadata
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Timelines
CREATE TABLE timelines (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,

  -- Timeline details
  start_date TEXT, -- Flexible format
  end_date TEXT,
  era_name TEXT, -- "The Great War", "Age of Discovery", etc.

  -- Visual
  color TEXT,
  icon TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  timeline_id UUID REFERENCES timelines(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  event_type_id UUID REFERENCES event_types(id) ON DELETE SET NULL,

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  description TEXT,

  -- Event details
  date TEXT, -- Flexible format
  date_year INTEGER, -- For sorting
  duration TEXT,

  -- Impact
  significance TEXT, -- minor, major, world-changing
  outcome TEXT,
  casualties TEXT,

  -- Visual
  image_url TEXT,
  color TEXT,

  -- Content
  content TEXT, -- Detailed description

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Tags (flexible categorization)
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Basic info
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Organization
  category TEXT, -- genre, theme, content-warning, etc.
  color TEXT,
  icon TEXT,

  -- Metadata
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moodboards
CREATE TABLE moodboards (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,

  -- Visual
  images TEXT[], -- Array of image URLs
  color_palette TEXT[],

  -- Can be attached to various entities
  entity_type TEXT, -- 'character', 'world', 'story', 'faction', etc.
  entity_id UUID,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Media assets (centralized media management)
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,

  -- Media details
  media_type media_type NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT, -- bytes
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- seconds (for video/audio)

  -- Organization
  folder TEXT,
  tags TEXT[],

  -- Attribution
  source TEXT,
  artist TEXT,
  license TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- JUNCTION TABLES (Many-to-Many Relationships)
-- ============================================================================

-- Character relationships
CREATE TABLE character_relationships (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- The two characters in the relationship
  character_a_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  character_b_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  relationship_type_id UUID NOT NULL REFERENCES relationship_types(id) ON DELETE CASCADE,

  -- Relationship details
  description TEXT,

  -- Is this bidirectional or one-way?
  is_mutual BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure we don't have duplicate relationships
  CONSTRAINT no_duplicate_relationships UNIQUE(character_a_id, character_b_id, relationship_type_id),
  -- Ensure a character doesn't have a relationship with themselves
  CONSTRAINT no_self_relationships CHECK(character_a_id != character_b_id)
);

-- Character-Faction memberships
CREATE TABLE character_factions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  faction_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,

  -- Membership details
  role TEXT, -- "Agent", "Commander", "Member", etc.
  rank TEXT,
  join_date TEXT,
  leave_date TEXT,
  is_current BOOLEAN DEFAULT true,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(character_id, faction_id)
);

-- Character-Event participation
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

  -- Participation details
  role TEXT, -- "participant", "leader", "victim", "witness", etc.
  description TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, character_id)
);

-- Faction-Event involvement
CREATE TABLE event_factions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  faction_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,

  -- Involvement details
  role TEXT, -- "aggressor", "defender", "organizer", "sponsor", etc.
  description TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, faction_id)
);

-- Tagging system (polymorphic tags)
CREATE TABLE entity_tags (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

  -- Can tag any entity type
  entity_type TEXT NOT NULL, -- 'story', 'world', 'character', 'faction', etc.
  entity_id UUID NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(tag_id, entity_type, entity_id)
);

-- Character-Location associations (where characters are from/live)
CREATE TABLE character_locations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

  -- Association type
  association_type TEXT, -- 'birthplace', 'residence', 'workplace', 'frequent', etc.
  time_period TEXT,
  notes TEXT,

  is_current BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Customizable type table indexes
CREATE INDEX idx_relationship_types_story_id ON relationship_types(story_id);
CREATE INDEX idx_relationship_types_slug ON relationship_types(slug);
CREATE INDEX idx_relationship_types_category ON relationship_types(category);

CREATE INDEX idx_event_types_story_id ON event_types(story_id);
CREATE INDEX idx_event_types_slug ON event_types(slug);

CREATE INDEX idx_outfit_types_story_id ON outfit_types(story_id);
CREATE INDEX idx_outfit_types_slug ON outfit_types(slug);

-- Story indexes
CREATE INDEX idx_stories_slug ON stories(slug);
CREATE INDEX idx_stories_created_by ON stories(created_by);
CREATE INDEX idx_stories_visibility ON stories(visibility);
CREATE INDEX idx_stories_is_published ON stories(is_published);
CREATE INDEX idx_stories_deleted_at ON stories(deleted_at);

-- World indexes
CREATE INDEX idx_worlds_story_id ON worlds(story_id);
CREATE INDEX idx_worlds_slug ON worlds(slug);
CREATE INDEX idx_worlds_deleted_at ON worlds(deleted_at);

-- Faction indexes
CREATE INDEX idx_factions_world_id ON factions(world_id);
CREATE INDEX idx_factions_parent_faction_id ON factions(parent_faction_id);
CREATE INDEX idx_factions_slug ON factions(slug);
CREATE INDEX idx_factions_deleted_at ON factions(deleted_at);

-- Location indexes
CREATE INDEX idx_locations_world_id ON locations(world_id);
CREATE INDEX idx_locations_parent_location_id ON locations(parent_location_id);
CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_locations_deleted_at ON locations(deleted_at);

-- Character indexes
CREATE INDEX idx_characters_world_id ON characters(world_id);
CREATE INDEX idx_characters_slug ON characters(slug);
CREATE INDEX idx_characters_status ON characters(status);
CREATE INDEX idx_characters_created_by ON characters(created_by);
CREATE INDEX idx_characters_deleted_at ON characters(deleted_at);

-- Character outfit indexes
CREATE INDEX idx_character_outfits_character_id ON character_outfits(character_id);
CREATE INDEX idx_character_outfits_outfit_type_id ON character_outfits(outfit_type_id);
CREATE INDEX idx_character_outfits_deleted_at ON character_outfits(deleted_at);

-- Character gallery indexes
CREATE INDEX idx_character_gallery_character_id ON character_gallery(character_id);
CREATE INDEX idx_character_gallery_deleted_at ON character_gallery(deleted_at);

-- Timeline indexes
CREATE INDEX idx_timelines_world_id ON timelines(world_id);
CREATE INDEX idx_timelines_deleted_at ON timelines(deleted_at);

-- Event indexes
CREATE INDEX idx_events_world_id ON events(world_id);
CREATE INDEX idx_events_timeline_id ON events(timeline_id);
CREATE INDEX idx_events_location_id ON events(location_id);
CREATE INDEX idx_events_event_type_id ON events(event_type_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_date_year ON events(date_year);
CREATE INDEX idx_events_deleted_at ON events(deleted_at);

-- Tag indexes
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_category ON tags(category);

-- Moodboard indexes
CREATE INDEX idx_moodboards_entity_type_id ON moodboards(entity_type, entity_id);
CREATE INDEX idx_moodboards_created_by ON moodboards(created_by);
CREATE INDEX idx_moodboards_deleted_at ON moodboards(deleted_at);

-- Media asset indexes
CREATE INDEX idx_media_assets_media_type ON media_assets(media_type);
CREATE INDEX idx_media_assets_created_by ON media_assets(created_by);
CREATE INDEX idx_media_assets_deleted_at ON media_assets(deleted_at);

-- Junction table indexes
CREATE INDEX idx_character_relationships_a ON character_relationships(character_a_id);
CREATE INDEX idx_character_relationships_b ON character_relationships(character_b_id);
CREATE INDEX idx_character_relationships_type_id ON character_relationships(relationship_type_id);

CREATE INDEX idx_character_factions_character ON character_factions(character_id);
CREATE INDEX idx_character_factions_faction ON character_factions(faction_id);
CREATE INDEX idx_character_factions_current ON character_factions(is_current);

CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_character ON event_participants(character_id);

CREATE INDEX idx_event_factions_event ON event_factions(event_id);
CREATE INDEX idx_event_factions_faction ON event_factions(faction_id);

CREATE INDEX idx_entity_tags_tag ON entity_tags(tag_id);
CREATE INDEX idx_entity_tags_entity ON entity_tags(entity_type, entity_id);

CREATE INDEX idx_character_locations_character ON character_locations(character_id);
CREATE INDEX idx_character_locations_location ON character_locations(location_id);

-- Full-text search indexes
CREATE INDEX idx_stories_title_search ON stories USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_characters_name_search ON characters USING gin(to_tsvector('english', name || ' ' || COALESCE(backstory, '')));
CREATE INDEX idx_factions_name_search ON factions USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_locations_name_search ON locations USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_relationship_types_updated_at BEFORE UPDATE ON relationship_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_types_updated_at BEFORE UPDATE ON event_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfit_types_updated_at BEFORE UPDATE ON outfit_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worlds_updated_at BEFORE UPDATE ON worlds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_factions_updated_at BEFORE UPDATE ON factions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_outfits_updated_at BEFORE UPDATE ON character_outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_gallery_updated_at BEFORE UPDATE ON character_gallery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timelines_updated_at BEFORE UPDATE ON timelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moodboards_updated_at BEFORE UPDATE ON moodboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_relationships_updated_at BEFORE UPDATE ON character_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_factions_updated_at BEFORE UPDATE ON character_factions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_locations_updated_at BEFORE UPDATE ON character_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- View: Character with all their factions
CREATE VIEW character_details AS
SELECT
  c.*,
  json_agg(
    DISTINCT jsonb_build_object(
      'faction_id', f.id,
      'faction_name', f.name,
      'role', cf.role,
      'rank', cf.rank,
      'is_current', cf.is_current
    )
  ) FILTER (WHERE f.id IS NOT NULL) AS factions
FROM characters c
LEFT JOIN character_factions cf ON c.id = cf.character_id
LEFT JOIN factions f ON cf.faction_id = f.id
WHERE c.deleted_at IS NULL
GROUP BY c.id;

-- View: Events with participants
CREATE VIEW event_details AS
SELECT
  e.*,
  w.name AS world_name,
  l.name AS location_name,
  json_agg(
    DISTINCT jsonb_build_object(
      'character_id', c.id,
      'character_name', c.name,
      'role', ep.role
    )
  ) FILTER (WHERE c.id IS NOT NULL) AS participants,
  json_agg(
    DISTINCT jsonb_build_object(
      'faction_id', f.id,
      'faction_name', f.name,
      'role', ef.role
    )
  ) FILTER (WHERE f.id IS NOT NULL) AS involved_factions
FROM events e
LEFT JOIN worlds w ON e.world_id = w.id
LEFT JOIN locations l ON e.location_id = l.id
LEFT JOIN event_participants ep ON e.id = ep.event_id
LEFT JOIN characters c ON ep.character_id = c.id
LEFT JOIN event_factions ef ON e.id = ef.event_id
LEFT JOIN factions f ON ef.faction_id = f.id
WHERE e.deleted_at IS NULL
GROUP BY e.id, w.name, l.name;

-- View: Story hierarchy (stories -> worlds -> key stats)
CREATE VIEW story_hierarchy AS
SELECT
  s.id AS story_id,
  s.title AS story_title,
  s.slug AS story_slug,
  s.is_published,
  s.visibility,
  json_agg(
    jsonb_build_object(
      'world_id', w.id,
      'world_name', w.name,
      'world_slug', w.slug,
      'character_count', (SELECT COUNT(*) FROM characters WHERE world_id = w.id AND deleted_at IS NULL),
      'faction_count', (SELECT COUNT(*) FROM factions WHERE world_id = w.id AND deleted_at IS NULL),
      'location_count', (SELECT COUNT(*) FROM locations WHERE world_id = w.id AND deleted_at IS NULL),
      'event_count', (SELECT COUNT(*) FROM events WHERE world_id = w.id AND deleted_at IS NULL)
    )
  ) FILTER (WHERE w.id IS NOT NULL) AS worlds
FROM stories s
LEFT JOIN worlds w ON s.id = w.story_id AND w.deleted_at IS NULL
WHERE s.deleted_at IS NULL
GROUP BY s.id;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Note: RLS is DISABLED for this wiki. All tables are publicly accessible.

-- RLS is disabled - all tables allow full public access for CRUD operations

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to search across all entities
CREATE OR REPLACE FUNCTION search_entities(search_query TEXT)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  entity_description TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY

  -- Search stories
  SELECT
    'story'::TEXT AS entity_type,
    s.id AS entity_id,
    s.title AS entity_name,
    s.description AS entity_description,
    ts_rank(to_tsvector('english', s.title || ' ' || COALESCE(s.description, '')), plainto_tsquery('english', search_query)) AS rank
  FROM stories s
  WHERE s.deleted_at IS NULL
    AND (s.visibility = 'public' AND s.is_published = true)
    AND to_tsvector('english', s.title || ' ' || COALESCE(s.description, '')) @@ plainto_tsquery('english', search_query)

  UNION ALL

  -- Search characters
  SELECT
    'character'::TEXT,
    c.id,
    c.name,
    c.backstory,
    ts_rank(to_tsvector('english', c.name || ' ' || COALESCE(c.backstory, '')), plainto_tsquery('english', search_query))
  FROM characters c
  WHERE c.deleted_at IS NULL
    AND to_tsvector('english', c.name || ' ' || COALESCE(c.backstory, '')) @@ plainto_tsquery('english', search_query)

  UNION ALL

  -- Search factions
  SELECT
    'faction'::TEXT,
    f.id,
    f.name,
    f.description,
    ts_rank(to_tsvector('english', f.name || ' ' || COALESCE(f.description, '')), plainto_tsquery('english', search_query))
  FROM factions f
  WHERE f.deleted_at IS NULL
    AND to_tsvector('english', f.name || ' ' || COALESCE(f.description, '')) @@ plainto_tsquery('english', search_query)

  UNION ALL

  -- Search locations
  SELECT
    'location'::TEXT,
    l.id,
    l.name,
    l.description,
    ts_rank(to_tsvector('english', l.name || ' ' || COALESCE(l.description, '')), plainto_tsquery('english', search_query))
  FROM locations l
  WHERE l.deleted_at IS NULL
    AND to_tsvector('english', l.name || ' ' || COALESCE(l.description, '')) @@ plainto_tsquery('english', search_query)

  ORDER BY rank DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to get character relationship graph
CREATE OR REPLACE FUNCTION get_character_relationships(character_uuid UUID)
RETURNS TABLE (
  related_character_id UUID,
  related_character_name TEXT,
  relationship_type_id UUID,
  relationship_type_name TEXT,
  relationship_description TEXT,
  is_mutual BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS related_character_id,
    c.name AS related_character_name,
    cr.relationship_type_id,
    rt.name AS relationship_type_name,
    cr.description AS relationship_description,
    cr.is_mutual
  FROM character_relationships cr
  JOIN characters c ON cr.character_b_id = c.id
  LEFT JOIN relationship_types rt ON cr.relationship_type_id = rt.id
  WHERE cr.character_a_id = character_uuid
    AND c.deleted_at IS NULL

  UNION ALL

  -- If relationships are mutual, also include reverse relationships
  SELECT
    c.id AS related_character_id,
    c.name AS related_character_name,
    cr.relationship_type_id,
    rt.name AS relationship_type_name,
    cr.description AS relationship_description,
    cr.is_mutual
  FROM character_relationships cr
  JOIN characters c ON cr.character_a_id = c.id
  LEFT JOIN relationship_types rt ON cr.relationship_type_id = rt.id
  WHERE cr.character_b_id = character_uuid
    AND cr.is_mutual = true
    AND c.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE stories IS 'Top-level story/universe containers with custom visual themes';
COMMENT ON TABLE worlds IS 'Physical or metaphysical worlds within stories';
COMMENT ON TABLE factions IS 'Organizations, corporations, guilds, and other groups';
COMMENT ON TABLE locations IS 'Places within worlds (continents, cities, buildings, etc.)';
COMMENT ON TABLE characters IS 'Original characters (OCs) with detailed profiles';
COMMENT ON TABLE character_outfits IS 'Multiple outfits/costumes for characters';
COMMENT ON TABLE character_gallery IS 'Artwork and visual media for characters';
COMMENT ON TABLE timelines IS 'Named time periods for organizing events';
COMMENT ON TABLE events IS 'Historical events, missions, and plot points';
COMMENT ON TABLE tags IS 'Flexible tagging system for all entities';
COMMENT ON TABLE moodboards IS 'Visual inspiration collections';
COMMENT ON TABLE media_assets IS 'Centralized media file management';
COMMENT ON TABLE character_relationships IS 'Relationships between characters';
COMMENT ON TABLE character_factions IS 'Character membership in factions';
COMMENT ON TABLE event_participants IS 'Characters involved in events';
COMMENT ON TABLE event_factions IS 'Factions involved in events';
COMMENT ON TABLE entity_tags IS 'Polymorphic tagging system';
COMMENT ON TABLE character_locations IS 'Character associations with locations';
COMMENT ON TABLE relationship_types IS 'Customizable relationship types per story';
COMMENT ON TABLE event_types IS 'Customizable event types per story';
COMMENT ON TABLE outfit_types IS 'Customizable outfit/costume types per story';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
