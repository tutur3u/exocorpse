-- MIGRATION UP
-- This section creates the necessary database objects.

-- 1. Create a reusable function to update the `updated_at` timestamp
-- This function will be called by a trigger.
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the `blog_posts` table
CREATE TABLE blog_posts (
  -- `SERIAL` is an auto-incrementing integer, perfect for a primary key
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- A URL-friendly version of the title (e.g., "my-first-post")
  -- It's set to `UNIQUE` so you can't have two posts with the same slug.
  slug VARCHAR(255) UNIQUE NOT NULL,

  -- The title of the blog post
  title VARCHAR(255) NOT NULL,

  -- The main content of the post, `TEXT` allows for unlimited length
  content TEXT NOT NULL,

  -- An optional short summary or teaser for the post
  excerpt TEXT NULL,

  -- Timestamp for when the post was created. Defaults to the current time.
  -- `TIMESTAMPTZ` stores the timestamp with the time zone (highly recommended).
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamp for the last time the post was updated.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamp for when the post should be considered "published".
  -- This is very flexible:
  -- - If `NULL`, the post is a draft.
  -- - If in the past, the post is published.
  -- - If in the future, the post is scheduled.
  published_at TIMESTAMPTZ NULL
);

-- 3. Create an index on `published_at`
-- This will speed up queries for finding all "published" posts.
CREATE INDEX idx_blog_posts_published_at ON blog_posts (published_at);

-- 4. Create the trigger to automatically update `updated_at`
-- This trigger calls the `trigger_set_timestamp` function
-- `BEFORE UPDATE` on any row in the `blog_posts` table.
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS) on blog_posts table

ALTER TABLE blog_posts enable ROW LEVEL SECURITY;

create policy "Enable delete for authenticated users"
on "public"."blog_posts"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."blog_posts"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for published posts"
on "public"."blog_posts"
as permissive
for select
to public
using (
  published_at is not null
  and published_at <= now()
);

create policy "Enable read access for all posts to authenticated users"
on "public"."blog_posts"
as permissive
for select
to authenticated
using (true);

create policy "Enable update for authenticated users"
on "public"."blog_posts"
as permissive
for update
to authenticated
using (true)
with check (true);

-- MIGRATION UP END

