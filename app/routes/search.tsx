/**
 * app/routes/search.tsx — Search page
 *
 * Uses Shopify's predictive search and regular search APIs via Hydrogen's
 * built-in helpers.
 */

import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { Image, Money } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import { getAsperContext } from "~/lib/context";
import { PRODUCT_CARD_FRAGMENT } from "~/lib/fragments";

export const meta: MetaFunction = () => [{ title: "Search — Asper Beauty" }];

const SEARCH_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Search(
    $query: String!
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query, sortKey: RELEVANCE) {
      nodes { ...ProductCard }
    }
  }
` as const;

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storefront } = getAsperContext(context);
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (!q) return json({ q, products: [] });

  const { products } = await storefront.query(SEARCH_QUERY, {
    variables: {
      query: q,
      first: 24,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheShort(),
  });

  return json({ q, products: products.nodes });
}

export default function SearchPage() {
  const { q, products } = useLoaderData<typeof loader>();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <h1
        style={{
          fontFamily: "Playfair Display, serif",
          color: "#800020",
          fontSize: "2rem",
          marginBottom: "1.5rem",
        }}
      >
        Search
      </h1>

      <Form method="get" style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products, brands…"
          autoComplete="off"
          style={{
            flex: 1,
            padding: "0.75rem 1.25rem",
            borderRadius: "0.5rem",
            border: "1.5px solid #ddd",
            fontFamily: "Montserrat, sans-serif",
            fontSize: "0.9375rem",
            background: "#F8F8FF",
            boxShadow: "var(--shadow-inset)",
            outline: "none",
          }}
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </Form>

      {q && products.length === 0 && (
        <p style={{ fontFamily: "Montserrat, sans-serif", color: "#6B6B6B" }}>
          No results for <strong>"{q}"</strong>. Try a different search term.
        </p>
      )}

      {products.length > 0 && (
        <>
          <p style={{ fontFamily: "Montserrat, sans-serif", color: "#6B6B6B", marginBottom: "1rem" }}>
            {products.length} result{products.length !== 1 ? "s" : ""} for{" "}
            <strong>"{q}"</strong>
          </p>
          <div className="product-grid">
            {products.map((product: {
              id: string;
              handle: string;
              title: string;
              vendor: string;
              availableForSale: boolean;
              featuredImage?: { url: string; altText?: string | null; width?: number; height?: number } | null;
              priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
            }) => (
              <Link
                key={product.id}
                to={`/products/${product.handle}`}
                className="product-card"
                style={{ textDecoration: "none" }}
                prefetch="intent"
              >
                {product.featuredImage ? (
                  <Image
                    data={product.featuredImage}
                    aspectRatio="1/1"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="product-card__image"
                  />
                ) : (
                  <div
                    style={{
                      aspectRatio: "1",
                      background: "#ede8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                    }}
                  >
                    🧴
                  </div>
                )}
                <div className="product-card__body">
                  <p className="product-card__brand">{product.vendor}</p>
                  <h3 className="product-card__title">{product.title}</h3>
                  <span className="product-card__price">
                    <Money data={product.priceRange.minVariantPrice} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
