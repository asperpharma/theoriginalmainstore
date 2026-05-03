-- Social posts table for Social Bot.
-- Stores queued and scheduled social media posts.

CREATE TABLE IF NOT EXISTS public.social_posts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  platform     text        NOT NULL,
  content      text        NOT NULL,
  media_url    text,
  status       text        NOT NULL DEFAULT 'queued'
                           CHECK (status IN ('queued', 'scheduled', 'posted', 'failed', 'cancelled')),
  scheduled_at timestamptz,
  posted_at    timestamptz,
  created_by   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- No permissive policy for anon/authenticated.
-- Service role (used by the bot) bypasses RLS automatically.

CREATE INDEX IF NOT EXISTS social_posts_status_created_at_idx
  ON public.social_posts (status, created_at DESC);

CREATE INDEX IF NOT EXISTS social_posts_status_scheduled_at_idx
  ON public.social_posts (status, scheduled_at);
