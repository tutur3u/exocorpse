CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE IF NOT EXISTS cofi_samples (
    id TEXT PRIMARY KEY,
    source_sample_id UUID NOT NULL,
    snapshot_index INTEGER NOT NULL UNIQUE,
    artist_name TEXT NOT NULL,
    artist_slug TEXT NOT NULL,
    booth_type TEXT NOT NULL,
    booth_location TEXT NOT NULL,
    joining_date TEXT NOT NULL,
    original_image_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    original_local_path TEXT NOT NULL,
    thumbnail_local_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    thumbnail_filename TEXT NOT NULL,
    original_extension TEXT NOT NULL,
    thumbnail_extension TEXT NOT NULL,
    original_content_type TEXT,
    thumbnail_content_type TEXT,
    original_bytes INTEGER NOT NULL,
    thumbnail_bytes INTEGER NOT NULL,
    search_text TEXT NOT NULL,
    search_tsv tsvector GENERATED ALWAYS AS (
        to_tsvector(
            'simple',
            coalesce(artist_name, '') || ' ' ||
            coalesce(artist_slug, '') || ' ' ||
            coalesce(booth_type, '') || ' ' ||
            coalesce(booth_location, '') || ' ' ||
            coalesce(joining_date, '') || ' ' ||
            coalesce(search_text, '')
        )
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cofi_sample_embeddings (
    sample_id TEXT PRIMARY KEY REFERENCES cofi_samples(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    task_type TEXT NOT NULL,
    dimensions INTEGER NOT NULL,
    content_hash TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cofi_samples_search_tsv
ON cofi_samples
USING gin(search_tsv);

CREATE INDEX IF NOT EXISTS idx_cofi_samples_artist_name
ON cofi_samples(artist_name);

CREATE INDEX IF NOT EXISTS idx_cofi_samples_booth_location
ON cofi_samples(booth_location);

CREATE INDEX IF NOT EXISTS idx_cofi_samples_booth_type_joining_date
ON cofi_samples(booth_type, joining_date);

CREATE INDEX IF NOT EXISTS idx_cofi_sample_embeddings_hnsw
ON cofi_sample_embeddings
USING hnsw (embedding vector_cosine_ops);

CREATE TRIGGER update_cofi_samples_updated_at
BEFORE UPDATE ON cofi_samples
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cofi_sample_embeddings_updated_at
BEFORE UPDATE ON cofi_sample_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE "public"."cofi_samples" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON "public"."cofi_samples"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."cofi_samples"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."cofi_samples"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON "public"."cofi_samples"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

ALTER TABLE "public"."cofi_sample_embeddings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."cofi_sample_embeddings"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON "public"."cofi_sample_embeddings"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON "public"."cofi_sample_embeddings"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true);

CREATE OR REPLACE FUNCTION search_cofi_samples_hybrid(
    p_query TEXT,
    p_query_embedding_text TEXT DEFAULT NULL,
    p_match_count INTEGER DEFAULT 48,
    p_booth_type TEXT DEFAULT NULL,
    p_joining_date TEXT DEFAULT NULL
)
RETURNS TABLE (
    id TEXT,
    source_sample_id UUID,
    snapshot_index INTEGER,
    artist_name TEXT,
    artist_slug TEXT,
    booth_type TEXT,
    booth_location TEXT,
    joining_date TEXT,
    original_image_url TEXT,
    thumbnail_url TEXT,
    original_local_path TEXT,
    thumbnail_local_path TEXT,
    original_filename TEXT,
    thumbnail_filename TEXT,
    original_extension TEXT,
    thumbnail_extension TEXT,
    original_content_type TEXT,
    thumbnail_content_type TEXT,
    original_bytes INTEGER,
    thumbnail_bytes INTEGER,
    combined_score REAL,
    lexical_score REAL,
    semantic_score REAL
)
LANGUAGE sql
STABLE
AS $$
WITH params AS (
    SELECT
        NULLIF(BTRIM(p_query), '') AS normalized_query,
        CASE
            WHEN p_query_embedding_text IS NULL OR BTRIM(p_query_embedding_text) = '' THEN NULL
            ELSE p_query_embedding_text::vector(1536)
        END AS query_embedding
),
lexical AS (
    SELECT
        s.id,
        LEAST(
            ts_rank_cd(
                s.search_tsv,
                websearch_to_tsquery('simple', params.normalized_query)
            ),
            1
        )::REAL AS lexical_score
    FROM cofi_samples s
    CROSS JOIN params
    WHERE params.normalized_query IS NOT NULL
      AND (p_booth_type IS NULL OR s.booth_type = p_booth_type)
      AND (p_joining_date IS NULL OR s.joining_date = p_joining_date)
      AND s.search_tsv @@ websearch_to_tsquery('simple', params.normalized_query)
),
semantic AS (
    SELECT
        s.id,
        GREATEST(
            0::REAL,
            1 - (e.embedding <=> params.query_embedding)
        )::REAL AS semantic_score
    FROM cofi_samples s
    INNER JOIN cofi_sample_embeddings e ON e.sample_id = s.id
    CROSS JOIN params
    WHERE params.query_embedding IS NOT NULL
      AND (p_booth_type IS NULL OR s.booth_type = p_booth_type)
      AND (p_joining_date IS NULL OR s.joining_date = p_joining_date)
    ORDER BY e.embedding <=> params.query_embedding
    LIMIT GREATEST(p_match_count * 4, 96)
),
combined AS (
    SELECT
        s.id,
        s.source_sample_id,
        s.snapshot_index,
        s.artist_name,
        s.artist_slug,
        s.booth_type,
        s.booth_location,
        s.joining_date,
        s.original_image_url,
        s.thumbnail_url,
        s.original_local_path,
        s.thumbnail_local_path,
        s.original_filename,
        s.thumbnail_filename,
        s.original_extension,
        s.thumbnail_extension,
        s.original_content_type,
        s.thumbnail_content_type,
        s.original_bytes,
        s.thumbnail_bytes,
        COALESCE(lexical.lexical_score, 0) AS lexical_score,
        COALESCE(semantic.semantic_score, 0) AS semantic_score,
        (
            COALESCE(semantic.semantic_score, 0) * 0.65 +
            COALESCE(lexical.lexical_score, 0) * 0.35
        )::REAL AS combined_score
    FROM cofi_samples s
    LEFT JOIN lexical ON lexical.id = s.id
    LEFT JOIN semantic ON semantic.id = s.id
    WHERE (p_booth_type IS NULL OR s.booth_type = p_booth_type)
      AND (p_joining_date IS NULL OR s.joining_date = p_joining_date)
      AND (
        lexical.id IS NOT NULL OR
        semantic.id IS NOT NULL
      )
)
SELECT
    combined.id,
    combined.source_sample_id,
    combined.snapshot_index,
    combined.artist_name,
    combined.artist_slug,
    combined.booth_type,
    combined.booth_location,
    combined.joining_date,
    combined.original_image_url,
    combined.thumbnail_url,
    combined.original_local_path,
    combined.thumbnail_local_path,
    combined.original_filename,
    combined.thumbnail_filename,
    combined.original_extension,
    combined.thumbnail_extension,
    combined.original_content_type,
    combined.thumbnail_content_type,
    combined.original_bytes,
    combined.thumbnail_bytes,
    combined.combined_score,
    combined.lexical_score,
    combined.semantic_score
FROM combined
ORDER BY
    combined.combined_score DESC,
    combined.semantic_score DESC,
    combined.lexical_score DESC,
    combined.snapshot_index ASC
LIMIT p_match_count;
$$;
