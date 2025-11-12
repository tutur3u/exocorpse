alter table "locations" drop column if exists "location_type";

alter table "locations" drop column if exists "climate";

alter table "locations" drop column if exists "coordinate_x";

alter table "locations" drop column if exists "coordinate_y";

alter table "locations" drop column if exists "coordinate_z";

alter table "locations" drop column if exists "content";

alter table "locations" add column "history" text;

alter table "locations" add column "geography" text;

-- Character gallery (artwork)
CREATE TABLE locations_gallery_images (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  location UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

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