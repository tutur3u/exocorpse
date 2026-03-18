CREATE TABLE IF NOT EXISTS heaven_space_scenes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    legacy_name TEXT,
    legacy_source TEXT,
    body_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    entry_effects JSONB NOT NULL DEFAULT '[]'::jsonb,
    ending TEXT,
    image_asset_id UUID REFERENCES heaven_space_assets(id) ON DELETE SET NULL,
    image_filename TEXT,
    map_position_x INTEGER,
    map_position_y INTEGER,
    is_start BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heaven_space_scenes_display_order
ON heaven_space_scenes(display_order);

CREATE INDEX IF NOT EXISTS idx_heaven_space_scenes_is_start
ON heaven_space_scenes(is_start);

CREATE TABLE IF NOT EXISTS heaven_space_scene_choices (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES heaven_space_scenes(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    target_scene_id UUID REFERENCES heaven_space_scenes(id) ON DELETE SET NULL,
    target_scene_slug TEXT NOT NULL,
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    effects JSONB NOT NULL DEFAULT '[]'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heaven_space_scene_choices_scene_id
ON heaven_space_scene_choices(scene_id, display_order);

CREATE INDEX IF NOT EXISTS idx_heaven_space_scene_choices_target_scene_id
ON heaven_space_scene_choices(target_scene_id);

CREATE TRIGGER update_heaven_space_scenes_updated_at
BEFORE UPDATE ON heaven_space_scenes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_heaven_space_scene_choices_updated_at
BEFORE UPDATE ON heaven_space_scene_choices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE "public"."heaven_space_scenes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON "public"."heaven_space_scenes"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."heaven_space_scenes"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."heaven_space_scenes"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON "public"."heaven_space_scenes"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

ALTER TABLE "public"."heaven_space_scene_choices" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON "public"."heaven_space_scene_choices"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."heaven_space_scene_choices"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."heaven_space_scene_choices"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON "public"."heaven_space_scene_choices"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);
