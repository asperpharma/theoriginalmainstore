/**
 * app/routes/_index.tsx — Hydrogen homepage
 *
 * Fetches featured collections and hero products from the Shopify Storefront API
 * and renders the Asper Beauty hero banner, USP bar, and product highlights.
 */

import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, Link } from "@remix-run/react";
import { Image, Money, getPaginationVariables } from "@shopify/hydrogen";
import { getAsperContext } from "~/lib/context";
import { PRODUCT_CARD_FRAGMENT, COLLECTION_CARD_FRAGMENT } from "~/lib/fragments";

// ── GraphQL queries ──────────────────────────────────────────────────────────

const HOMEPAGE_QUERY = `#graphql
  ${COLLECTION_CARD_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  query Homepage($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    featuredCollections: collections(first: 6, sortKey: UPDATED_AT) {
      nodes { ...CollectionCard }
    }
    featuredProducts: products(first: 8, sortKey: BEST_SELLING) {
      nodes { ...ProductCard }
    }
  }
` as const;

// ── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = getAsperContext(context);
  const data = await storefront.query(HOMEPAGE_QUERY, {
    variables: { country: storefront.i18n.country, language: storefront.i18n.language },
    cache: storefront.CacheShort(),
  });
  return { ...data };
}

// ── Meta ─────────────────────────────────────────────────────────────────────

export const meta: MetaFunction<typeof loader> = () => [
  { title: "Asper Beauty Shop — Medical-Grade Skincare · Jordan" },
  {
    name: "description",
    content:
      "Shop 10,000+ skincare and beauty products from 350+ clinical brands. Free delivery in Jordan.",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function Homepage() {
  const { featuredCollections, featuredProducts } = useLoaderData<typeof loader>();

  return (
    <>
      {/* Hero */}
      <section
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a0008 0%, #800020 60%, #2d0010 100%)",
          color: "#F8F8FF",
          textAlign: "center",
          padding: "4rem 2rem",
        }}
      >
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.3em",
            color: "#C5A028",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          Medical Luxury · عناية طبية فاخرة
        </p>
        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            margin: "0 0 1.5rem",
          }}
        >
          Where Science Meets<br />
          <em style={{ color: "#C5A028" }}>Elegance</em>
        </h1>
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "1.0625rem",
            color: "#d4b8be",
            maxWidth: "520px",
            marginBottom: "2.5rem",
          }}
        >
          10,000+ products from 350+ clinical brands. Curated by pharmacists for
          radiant skin — delivered across Jordan.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/collections/all" className="btn-primary" prefetch="intent">
            Shop Now
          </Link>
          <Link to="/pages/about" className="btn-secondary" style={{ color: "#F8F8FF", borderColor: "#C5A028" }}>
            Our Story
          </Link>
        </div>
      </section>

      {/* USP Bar */}
      <section
        style={{
          background: "#1a0008",
          color: "#C5A028",
          padding: "1.25rem 2rem",
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          flexWrap: "wrap",
          fontFamily: "Montserrat, sans-serif",
          fontSize: "0.8125rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {[
          "✦ Free Delivery in Jordan",
          "✦ 350+ Clinical Brands",
          "✦ Pharmacist-Curated",
          "✦ Authentic Guaranteed",
        ].map((usp) => (
          <span key={usp}>{usp}</span>
        ))}
      </section>

      {/* Featured Collections */}
      {featuredCollections?.nodes?.length > 0 && (
        <section style={{ padding: "4rem 2rem" }}>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "2rem",
              color: "#800020",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            Shop by Category
          </h2>
          <div className="product-grid">
            {featuredCollections.nodes.map((collection: {
              id: string;
              handle: string;
              title: string;
              description?: string;
              image?: { url: string; altText?: string | null; width?: number; height?: number } | null;
            }) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.handle}`}
                className="neu-card"
                style={{ textDecoration: "none", overflow: "hidden" }}
                prefetch="intent"
              >
                {collection.image && (
                  <Image
                    data={collection.image}
                    aspectRatio="16/9"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ width: "100%", display: "block" }}
                  />
                )}
                <div style={{ padding: "1rem" }}>
                  <h3
                    style={{
                      fontFamily: "Playfair Display, serif",
                      fontSize: "1.125rem",
                      color: "#800020",
                      margin: 0,
                    }}
                  >
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "0.8125rem",
                        color: "#6B6B6B",
                        marginTop: "0.5rem",
                      }}
                    >
                      {collection.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {featuredProducts?.nodes?.length > 0 && (
        <section style={{ padding: "2rem 2rem 4rem" }}>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "2rem",
              color: "#800020",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            Best Sellers
          </h2>
          <div className="product-grid">
            {featuredProducts.nodes.map((product: {
              id: string;
              handle: string;
              title: string;
              vendor: string;
              availableForSale: boolean;
              featuredImage?: { url: string; altText?: string | null; width?: number; height?: number } | null;
              priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
              compareAtPriceRange?: { minVariantPrice: { amount: string; currencyCode: string } };
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
                      color: "#aaa",
                      fontSize: "2rem",
                    }}
                  >
                    🧴
                  </div>
                )}
                <div className="product-card__body">
                  <p className="product-card__brand">{product.vendor}</p>
                  <h3 className="product-card__title">{product.title}</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <span className="product-card__price">
                      <Money data={product.priceRange.minVariantPrice} />
                    </span>
                  </div>
                  {!product.availableForSale && (
                    <span style={{ fontSize: "0.75rem", color: "#999" }}>Out of stock</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link to="/collections/all" className="btn-primary">
              View All Products
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
