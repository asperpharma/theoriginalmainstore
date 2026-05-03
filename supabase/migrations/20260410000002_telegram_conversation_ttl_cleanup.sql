-- Daily cleanup of stale Telegram conversations (idle >24h).
-- CASCADE on messages FK means deleting a conversation also deletes its messages.
-- Runs at 02:00 UTC every day (off-peak for Jordan).

select cron.schedule(
  'telegram-conversation-ttl-cleanup',
  '0 2 * * *',
  $$
    delete from conversations
    where title like 'telegram:%'
      and id not in (
        select conversation_id
        from messages
        where created_at > now() - interval '24 hours'
      );
  $$
);
