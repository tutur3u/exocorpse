-- Game Pieces RLS Policies

ALTER TABLE "public"."game_pieces" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for authenticated users"
ON "public"."game_pieces"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."game_pieces"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON "public"."game_pieces"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."game_pieces"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Game Piece Gallery Images RLS Policies

ALTER TABLE "public"."game_piece_gallery_images" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for authenticated users"
ON "public"."game_piece_gallery_images"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."game_piece_gallery_images"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON "public"."game_piece_gallery_images"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."game_piece_gallery_images"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);