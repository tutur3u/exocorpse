-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a weekly cron job to delete expired resource URLs
-- Runs every Sunday at midnight UTC (0 0 * * 0)
SELECT cron.schedule(
  'delete_expired_resource_urls',
  '0 0 * * 0', -- Every Sunday at 00:00 UTC
  $$
    DELETE FROM resource_urls
    WHERE expired_at < NOW();
  $$
);

