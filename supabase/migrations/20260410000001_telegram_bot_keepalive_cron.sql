-- Telegram bot keepalive: ping the Edge Function every minute during business hours
-- (03:00–20:00 UTC = 06:00–23:00 Amman time) to prevent cold starts.
-- Requires pg_cron and pg_net extensions (both already installed).

select cron.schedule(
  'telegram-bot-keepalive',
  '* 3-20 * * *',
  $$
    select net.http_post(
      url     := 'https://vhgwvfedgfmcixhdyttt.supabase.co/functions/v1/telegram-bot',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3d2ZmVkZ2ZtY2l4aGR5dHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODkxNzYsImV4cCI6MjA4ODc2NTE3Nn0.y4i2HUWVo05AbzJVPn4pO-pw9n4KiSx9rZAgEWhkW60"}'::jsonb,
      body    := '{}'::jsonb
    ) as request_id;
  $$
);
