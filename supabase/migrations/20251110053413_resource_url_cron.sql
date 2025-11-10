-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule the job if it already exists
SELECT cron.unschedule('delete_expired_resource_urls') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'delete_expired_resource_urls'
);

 SELECT cron.schedule(
   'delete_expired_resource_urls',
   '0 0 * * 0', -- Every Sunday at 00:00 UTC
   $$
     DELETE FROM resource_urls
     WHERE expired_at < NOW();
   $$
 );




