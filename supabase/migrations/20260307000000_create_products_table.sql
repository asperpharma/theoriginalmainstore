-- ============================================================
-- PRODUCTS — foundational table
-- Must run before any ALTER TABLE public.products migrations.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core identity
  name                text        NOT NULL,
  title               text,
  handle              text        UNIQUE,
  brand               text        NOT NULL DEFAULT '',
  category            text        NOT NULL DEFAULT 'Skincare',
  description         text        NOT NULL DEFAULT '',

  -- Pricing
  price               numeric     NOT NULL DEFAULT 0 CHECK (price >= 0),

  -- Media
  image_url           text,

  -- Skincare metadata
  primary_concern     text,
  regimen_step        text,
  tags                text[]      NOT NULL DEFAULT '{}',
  key_ingredients     text[]      NOT NULL DEFAULT '{}',
  pharmacist_note     text,
  clinical_badge      text,
  key_benefit         text,

  -- Availability
  availability_status text        NOT NULL DEFAULT 'in_stock',
  in_stock            boolean     NOT NULL DEFAULT true,
  is_hero             boolean     NOT NULL DEFAULT false,
  is_bestseller       boolean     NOT NULL DEFAULT false,

  -- Enrichment (added later via ALTER but included here for new installs)
  bestseller_rank     integer,
  condition           text,
  gold_stitch_tier    boolean     NOT NULL DEFAULT false,
  gtin                text,
  hex_swatch          text,
  mpn                 text,
  product_highlights  text[]      NOT NULL DEFAULT '{}',
  texture_profile     text,
  ai_persona_lead     text,

  -- Timestamps
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS products_brand_idx      ON public.products (brand);
CREATE INDEX IF NOT EXISTS products_category_idx   ON public.products (category);
CREATE INDEX IF NOT EXISTS products_in_stock_idx   ON public.products (in_stock);
CREATE INDEX IF NOT EXISTS products_is_hero_idx    ON public.products (is_hero);
CREATE INDEX IF NOT EXISTS products_handle_idx     ON public.products (handle);

-- Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public read products"
  ON public.products FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Admins manage products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
