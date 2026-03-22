-- Enable pg_cron and pg_net for scheduled Edge Function invocation
-- pg_cron: scheduler    pg_net: async HTTP from within Postgres
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule daily-checkin-batch at 9:00 AM IST (03:30 UTC)
-- pg_net makes an HTTP POST to the Edge Function with the service role key
SELECT cron.schedule(
  'daily-checkin-batch',          -- job name
  '30 3 * * *',                   -- 03:30 UTC = 9:00 AM IST
  $$
  SELECT net.http_post(
    url    := current_setting('app.supabase_url') || '/functions/v1/daily-checkin-batch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body   := '{}'::jsonb
  );
  $$
);

-- Grant pg_cron usage to postgres role (required on Supabase)
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
