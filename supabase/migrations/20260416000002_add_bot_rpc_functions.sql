-- RPC functions for Telegram bot admin commands.
-- Fixes N+1 queries and in-memory aggregation issues.

-- 1. Bulk price update: single UPDATE instead of per-row loop
CREATE OR REPLACE FUNCTION public.bulk_price_update(
  p_brand text,
  p_multiplier numeric
)
RETURNS integer
LANGUAGE sql
AS $$
  WITH updated AS (
    UPDATE public.products
    SET price = ROUND((price * p_multiplier)::numeric, 2),
        updated_at = now()
    WHERE available = true
      AND brand ILIKE '%' || p_brand || '%'
      AND price IS NOT NULL
    RETURNING id
  )
  SELECT count(*)::integer FROM updated;
$$;

-- 2. Top sellers aggregation: done in DB instead of fetching all rows to JS
CREATE OR REPLACE FUNCTION public.top_sellers_30d(p_limit integer DEFAULT 15)
RETURNS TABLE(product_name text, total_sold bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(item->>'title', item->>'name', 'Unknown') AS product_name,
    SUM((COALESCE(item->>'quantity', '1'))::bigint) AS total_sold
  FROM public.cod_orders,
       jsonb_array_elements(items) AS item
  WHERE created_at >= now() - interval '30 days'
  GROUP BY 1
  ORDER BY total_sold DESC
  LIMIT p_limit;
$$;
