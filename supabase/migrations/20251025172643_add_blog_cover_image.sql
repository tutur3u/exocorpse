-- Add cover image field to blog_posts table
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS cover_url VARCHAR(500);

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_blog_posts_cover_url
  ON blog_posts(cover_url)
  WHERE cover_url IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN blog_posts.cover_url IS 'URL or storage path to the cover image for this blog post';
