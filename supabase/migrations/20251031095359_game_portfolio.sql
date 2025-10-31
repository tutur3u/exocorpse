-- 1. Enable the 'uuid-ossp' extension to generate UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create a reusable function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';


-- 3. Create the 'game_pieces' table
CREATE TABLE IF NOT EXISTS game_pieces (
    -- Primary Key (UUID)
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Required Fields
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    game_url TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attach the trigger to the 'game_pieces' table
CREATE TRIGGER update_game_pieces_updated_at
BEFORE UPDATE ON game_pieces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 5. Create the 'game_piece_gallery_images' table
CREATE TABLE IF NOT EXISTS game_piece_gallery_images (
    -- Primary Key (UUID)
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign Key to 'game_pieces'
    -- ON DELETE CASCADE means if a game_piece is deleted,
    -- all its associated gallery images are also deleted.
    game_piece_id UUID NOT NULL REFERENCES game_pieces(id) ON DELETE CASCADE,

    -- Image details
    image_url TEXT NOT NULL,
    description TEXT,
    display_order SMALLINT DEFAULT 0, -- To allow sorting the gallery

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create an index on the foreign key for faster lookups
CREATE INDEX IF NOT EXISTS idx_gallery_game_piece_id ON game_piece_gallery_images(game_piece_id);

-- 7. Attach the trigger to the 'game_piece_gallery_images' table
CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON game_piece_gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();