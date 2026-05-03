-- Update telegram-bot keepalive cron to point at the new Supabase project
-- (vhgwvfedgfmcixhdyttt → mpcxpydkzvwlflxcujnz).
--
-- This migration only UNSCHEDULES the stale job. Rescheduling is left as a
-- production-operator step so branch previews don't accidentally keep-alive
-- the production project, and so the anon key is never committed to git.
--
-- To re-schedule on the production project, store the anon key in vault:
--
--   select vault.create_secret('<anon-key>', 'supabase_anon_key');
--
-- then run:
--
--   do $$
--   declare
--     v_anon_key text;
--   begin
--     select decrypted_secret into v_anon_key
--       from vault.decrypted_secrets
--       where name = 'supabase_anon_key'
--       limit 1;
--
--     if v_anon_key is null then
--       raise exception 'supabase_anon_key not found in vault';
--     end if;
--
--     perform cron.schedule(
--       'telegram-bot-keepalive',
--       '*/10 3-20 * * *',
--       format(
--         $f$select net.http_post(
--           url     := %L,
--           headers := %L::jsonb,
--           body    := '{}'::jsonb
--         ) as request_id$f$,
--         'https://mpcxpydkzvwlflxcujnz.supabase.co/functions/v1/telegram-bot',
--         json_build_object(
--           'Content-Type', 'application/json',
--           'Authorization', 'Bearer ' || v_anon_key
--         )::text
--       )
--     );
--   end $$;

select cron.unschedule('telegram-bot-keepalive')
where exists (
  select 1 from cron.job where jobname = 'telegram-bot-keepalive'
);
