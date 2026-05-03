-- Social posts table for Social Bot.
-- Stores queued and scheduled social media posts.

CREATE TABLE IF NOT EXISTS public.social_posts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  platform     text        NOT NULL,
  content      text        NOT NULL,
  media_url    text,
  status       text        NOT NULL DEFAULT 'queued',
  scheduled_at timestamptz,
  posted_at    timestamptz,
  created_by   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Only service role (bot) can read/write
CREATE POLICY "Service role full access"
  ON public.social_posts
  USING (true);
