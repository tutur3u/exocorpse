alter table "locations_gallery_images" enable row level security;

-- Policies for location_gallery_images

-- Allow anyone to select non-deleted images

CREATE POLICY "Enable delete for authenticated users"
ON "public"."locations_gallery_images"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."locations_gallery_images"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON "public"."locations_gallery_images"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."locations_gallery_images"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);