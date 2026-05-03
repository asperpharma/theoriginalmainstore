-- Site configuration table for Telegram bot admin control.
-- Stores key-value settings like announcements, hero text, promos, etc.

create table if not exists public.site_config (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_config enable row level security;

-- Allow public read (frontend needs to fetch config)
create policy "Anyone can read site config"
  on public.site_config for select
  using (true);

-- Only service role (telegram bot) can write
-- No insert/update/delete policy for anon — bot uses service role key
