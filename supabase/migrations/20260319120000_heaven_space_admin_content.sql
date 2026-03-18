CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS heaven_space_passages (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heaven_space_passages_display_order
ON heaven_space_passages(display_order);

CREATE TABLE IF NOT EXISTS heaven_space_assets (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    filename TEXT NOT NULL UNIQUE,
    image_url TEXT NOT NULL DEFAULT '',
    alt_text TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heaven_space_assets_display_order
ON heaven_space_assets(display_order);

CREATE TRIGGER update_heaven_space_passages_updated_at
BEFORE UPDATE ON heaven_space_passages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_heaven_space_assets_updated_at
BEFORE UPDATE ON heaven_space_assets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE "public"."heaven_space_passages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON "public"."heaven_space_passages"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."heaven_space_passages"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."heaven_space_passages"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON "public"."heaven_space_passages"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

ALTER TABLE "public"."heaven_space_assets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON "public"."heaven_space_assets"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."heaven_space_assets"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."heaven_space_assets"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON "public"."heaven_space_assets"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);
