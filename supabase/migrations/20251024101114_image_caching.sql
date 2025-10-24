CREATE TABLE resource_urls (
    -- The path of the resource (primary key)
    resource_path TEXT PRIMARY KEY,

    -- The signed URL of the resource
    url TEXT NOT NULL,

    -- The timestamp when the URL expires
    expired_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Track when the cache entry was created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Track when the cache entry was last updated
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for efficient expiration lookups
CREATE INDEX idx_resource_urls_expired_at ON resource_urls(expired_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_resource_urls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resource_urls_updated_at
    BEFORE UPDATE ON resource_urls
    FOR EACH ROW
    EXECUTE FUNCTION update_resource_urls_updated_at();