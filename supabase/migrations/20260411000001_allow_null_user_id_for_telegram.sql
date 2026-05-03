-- Allow null user_id for Telegram bot conversations.
-- Telegram users don't have auth.users accounts, so we need to permit
-- null user_id for conversations with titles like 'telegram:%'.

alter table public.conversations
  alter column user_id drop not null;

-- Update RLS policy to handle both authenticated users and telegram conversations.
-- Note: The telegram bot uses service role key, so RLS is bypassed for bot operations,
-- but we update policies for consistency and potential future read-only access.
drop policy if exists "Users manage own conversations" on public.conversations;

-- Allow authenticated users to manage their own conversations (user_id must match)
create policy "Users manage own conversations"
  on public.conversations for all
  using (user_id is not null and auth.uid() = user_id);

-- Update messages policy to handle telegram conversations (null user_id)
drop policy if exists "Users manage own messages" on public.messages;

-- Allow authenticated users to manage messages in their own conversations
-- OR messages in telegram conversations (user_id is null)
create policy "Users manage own messages"
  on public.messages for all
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_id = auth.uid() or c.user_id is null)
    )
  );
