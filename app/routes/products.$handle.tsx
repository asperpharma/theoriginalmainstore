/**
 * app/routes/products.$handle.tsx — Product Detail Page (PDP)
 *
 * Fetches a single product by handle via the Shopify Storefront API and
 * renders the Asper Beauty product detail layout with variant selection
 * and add-to-cart form.
 */

import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@shopify/remix-oxygen";
import { useLoaderData } from "@remix-run/react";
import { Image, Money, CartForm, VariantSelector } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import { getAsperContext } from "~/lib/context";

// ── Query ─────────────────────────────────────────────────────────────────────

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      descriptionHtml
      availableForSale
      seo { title description }
      images(first: 6) {
        nodes { url altText width height }
      }
      options {
        name
        values
      }
      variants(first: 50) {
        nodes {
          id
          availableForSale
          quantityAvailable
          selectedOptions { name value }
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          image { url altText width height }
        }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        minVariantPrice { amount currencyCode }
      }
    }
  }
` as const;

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { handle } = params;
  if (!handle) throw new Response("Not found", { status: 404 });

  const { storefront } = getAsperContext(context);
  const { product } = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheShort(),
  });

  if (!product) throw new Response("Product not found", { status: 404 });

  return json({ product });
}

// ── Meta ──────────────────────────────────────────────────────────────────────

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) return [{ title: "Product not found" }];
  const { product } = data;
  return [
    { title: `${product.seo?.title ?? product.title} — Asper Beauty` },
    { name: "description", content: product.seo?.description ?? "" },
  ];
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>();
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = firstVariant;

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4rem",
        alignItems: "start",
      }}
      className="pdp-grid"
    >
      {/* Gallery */}
      <div>
        {product.images.nodes[0] ? (
          <Image
            data={product.images.nodes[0]}
            aspectRatio="1/1"
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{
              width: "100%",
              borderRadius: "1rem",
              boxShadow: "var(--shadow-raised)",
            }}
          />
        ) : (
          <div
            style={{
              aspectRatio: "1",
              background: "#ede8f0",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4rem",
            }}
          >
            🧴
          </div>
        )}

        {/* Thumbnails */}
        {product.images.nodes.length > 1 && (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            {product.images.nodes.slice(1).map((img: { url: string; altText?: string | null; width?: number; height?: number }, i: number) => (
              <Image
                key={i}
                data={img}
                aspectRatio="1/1"
                sizes="80px"
                style={{
                  width: "80px",
                  borderRadius: "0.5rem",
                  boxShadow: "var(--shadow-raised)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#C5A028",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            margin: 0,
          }}
        >
          {product.vendor}
        </p>

        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            color: "#333",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {product.title}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.75rem",
          }}
        >
          <span
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#800020",
            }}
          >
            <Money data={selectedVariant.price} />
          </span>
          {selectedVariant.compareAtPrice && (
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "1rem",
                color: "#999",
                textDecoration: "line-through",
              }}
            >
              <Money data={selectedVariant.compareAtPrice} />
            </span>
          )}
        </div>

        {/* Variant selector */}
        {product.options.some((o: { name: string; values: string[] }) => o.values.length > 1) && (
          <VariantSelector handle={product.handle} options={product.options} variants={product.variants.nodes}>
            {({ option }: { option: { name: string; values: Array<{ value: string; isAvailable: boolean; isActive: boolean; to: string }> } }) => (
              <div key={option.name} style={{ marginBottom: "0.75rem" }}>
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#555",
                    marginBottom: "0.5rem",
                  }}
                >
                  {option.name}
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {option.values.map(({ value, isAvailable, isActive, to }) => (
                    <a
                      key={value}
                      href={to}
                      style={{
                        padding: "0.375rem 0.875rem",
                        borderRadius: "0.375rem",
                        border: `1.5px solid ${isActive ? "#800020" : "#ddd"}`,
                        background: isActive ? "#800020" : "transparent",
                        color: isActive ? "#fff" : isAvailable ? "#333" : "#bbb",
                        fontSize: "0.8125rem",
                        fontFamily: "Montserrat, sans-serif",
                        textDecoration: "none",
                        cursor: isAvailable ? "pointer" : "not-allowed",
                        opacity: isAvailable ? 1 : 0.5,
                        transition: "all 200ms",
                      }}
                    >
                      {value}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </VariantSelector>
        )}

        {/* Add to cart */}
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesAdd}
          inputs={{ lines: [{ merchandiseId: selectedVariant.id, quantity: 1 }] }}
        >
          <button
            className="btn-primary"
            type="submit"
            disabled={!selectedVariant.availableForSale}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {selectedVariant.availableForSale ? "Add to Cart" : "Sold Out"}
          </button>
        </CartForm>

        {/* Description */}
        {product.descriptionHtml && (
          <div
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.9375rem",
              color: "#555",
              lineHeight: 1.7,
              borderTop: "1px solid #e8e0e4",
              paddingTop: "1.5rem",
              marginTop: "0.5rem",
            }}
          />
        )}
      </div>
    </div>
  );
}
