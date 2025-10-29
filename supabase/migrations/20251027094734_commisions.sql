-- 
-- PostgreSQL Schema Migration File: Commission Service (Corrected Logic)
-- 

-- 1. Enable the UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-----------------------------------------------------------------------
-- 2. SERVICES Table (No Change)
-----------------------------------------------------------------------
CREATE TABLE services (
    service_id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE, 
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    comm_link VARCHAR(512), -- Link to commission form or page
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_slug ON services (slug);


-----------------------------------------------------------------------
-- 3. ADDONS Table (Modified to remove UNIQUE constraint, as it's enforced 
--    on the junction table via the index below)
-----------------------------------------------------------------------
CREATE TABLE addons (
    addon_id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    name VARCHAR(255) NOT NULL UNIQUE,
    is_exclusive BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE = one service only, FALSE = many services
    description TEXT,
    price_impact NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price_impact >= 0)
);

-----------------------------------------------------------------------
-- 4. SERVICE_ADDONS Table (Junction Table - NEW COLUMN)
-----------------------------------------------------------------------
CREATE TABLE service_addons (
    service_id UUID NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES addons(addon_id) ON DELETE CASCADE,
    
    -- NEW COLUMN: A redundant copy of the is_exclusive flag from the addons table.
    -- This is necessary because the index predicate (WHERE clause) cannot use a subquery 
    -- to look up the value in the 'addons' table.
    addon_is_exclusive BOOLEAN NOT NULL, 

    PRIMARY KEY (service_id, addon_id)
);

-- CRUCIAL STEP: Corrected Partial Unique Index.
-- This index references only columns in the service_addons table.
-- It enforces that for any row where addon_is_exclusive is TRUE, the addon_id 
-- cannot be duplicated (i.e., tied to only one service).
CREATE UNIQUE INDEX idx_exclusive_addon_service 
ON service_addons (addon_id) 
WHERE addon_is_exclusive = TRUE;

-----------------------------------------------------------------------
-- 5. TRIGGER FUNCTION AND TRIGGER (Ensures Data Integrity)
-- This function automatically copies the 'is_exclusive' flag from 'addons'
-- to 'service_addons' on every new INSERT.
-----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_addon_exclusive_flag()
RETURNS TRIGGER AS $$
BEGIN
    -- Look up the is_exclusive status from the referenced addon
    SELECT is_exclusive INTO NEW.addon_is_exclusive
    FROM addons
    WHERE addon_id = NEW.addon_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_addon_exclusive_flag
BEFORE INSERT ON service_addons
FOR EACH ROW
EXECUTE FUNCTION set_addon_exclusive_flag();


CREATE OR REPLACE FUNCTION prevent_exclusive_flag_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_exclusive = TRUE AND OLD.is_exclusive = FALSE THEN
        IF (SELECT COUNT(DISTINCT service_id) FROM service_addons WHERE addon_id = NEW.addon_id) > 1 THEN
            RAISE EXCEPTION 'Cannot set addon to exclusive: already associated with multiple services';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_exclusive_change
BEFORE UPDATE ON addons
FOR EACH ROW
WHEN (OLD.is_exclusive IS DISTINCT FROM NEW.is_exclusive)
EXECUTE FUNCTION prevent_exclusive_flag_change();

-----------------------------------------------------------------------
-- 6. STYLES Table (No Change)
-----------------------------------------------------------------------
CREATE TABLE styles (
    style_id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    service_id UUID NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    UNIQUE (service_id, name)
);

CREATE INDEX idx_styles_service_id ON styles (service_id);

-----------------------------------------------------------------------
-- 7. PICTURES Table
-----------------------------------------------------------------------
CREATE TABLE pictures (
    picture_id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    style_id UUID REFERENCES styles(style_id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL, 
    caption VARCHAR(512),
    is_primary_example BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: A picture must have either a style_id OR be directly linked to a service
    -- If style_id is NULL, it's a service-level picture. If style_id is set, it's a style-level picture.
    CONSTRAINT pictures_style_or_service_check 
        CHECK (style_id IS NOT NULL OR service_id IS NOT NULL)
);

CREATE INDEX idx_pictures_style_id ON pictures (style_id);
CREATE INDEX idx_pictures_service_id ON pictures (service_id);

-----------------------------------------------------------------------
-- 8. TRIGGER FUNCTION FOR PICTURES (Validates style-service consistency)
-- Ensures that if a picture has a style, the service_id matches the style's parent service
-----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_picture_style_service()
RETURNS TRIGGER AS $$
BEGIN
    -- If style_id is provided, verify it belongs to the service_id
    IF NEW.style_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM styles
            WHERE style_id = NEW.style_id
            AND service_id = NEW.service_id
        ) THEN
            RAISE EXCEPTION 'Style % does not belong to service %', NEW.style_id, NEW.service_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_picture_style_service
BEFORE INSERT OR UPDATE ON pictures
FOR EACH ROW
EXECUTE FUNCTION validate_picture_style_service();

-----------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-----------------------------------------------------------------------
-- Enable RLS on all tables and apply consistent policies:
-- - Public read access for all users
-- - Write access (insert, update, delete) for authenticated users only

-- Services
ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for authenticated users"
ON "public"."services"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."services"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON "public"."services"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."services"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Addons
ALTER TABLE "public"."addons" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for authenticated users"
ON "public"."addons"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."addons"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON "public"."addons"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."addons"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Service Addons
ALTER TABLE "public"."service_addons" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for authenticated users"
ON "public"."service_addons"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."service_addons"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON "public"."service_addons"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."service_addons"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Styles
ALTER TABLE "public"."styles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for authenticated users"
ON "public"."styles"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."styles"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON "public"."styles"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."styles"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Pictures
ALTER TABLE "public"."pictures" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable delete for authenticated users"
ON "public"."pictures"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."pictures"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access for all users"
ON "public"."pictures"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."pictures"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);