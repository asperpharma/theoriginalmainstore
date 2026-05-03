/**
 * app/routes/collections.$handle.tsx — Collection / Product Listing Page (PLP)
 *
 * Fetches a Shopify collection by handle with cursor-based pagination
 * powered by Hydrogen's usePagination hook.
 */

import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, Link } from "@remix-run/react";
import { Pagination, getPaginationVariables, Image, Money } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import { getAsperContext } from "~/lib/context";
import { PRODUCT_CARD_FRAGMENT } from "~/lib/fragments";

// ── Query ─────────────────────────────────────────────────────────────────────

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Collection(
    $handle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText width height }
      products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
        nodes { ...ProductCard }
        pageInfo {
          hasPreviousPage hasNextPage
          startCursor endCursor
        }
      }
    }
  }
` as const;

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { handle } = params;
  if (!handle) throw new Response("Not found", { status: 404 });

  const { storefront } = getAsperContext(context);
  const paginationVariables = getPaginationVariables(request, { pageBy: 24 });

  const { collection } = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      ...paginationVariables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheShort(),
  });

  if (!collection) throw new Response("Collection not found", { status: 404 });

  return json({ collection });
}

// ── Meta ──────────────────────────────────────────────────────────────────────

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.collection) return [{ title: "Collection not found" }];
  return [
    { title: `${data.collection.title} — Asper Beauty` },
    { name: "description", content: data.collection.description ?? "" },
  ];
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CollectionPage() {
  const { collection } = useLoaderData<typeof loader>();

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        {collection.image && (
          <div
            style={{
              borderRadius: "1rem",
              overflow: "hidden",
              maxHeight: "360px",
              marginBottom: "2rem",
              boxShadow: "var(--shadow-raised)",
            }}
          >
            <Image
              data={collection.image}
              aspectRatio="16/5"
              sizes="100vw"
              style={{ width: "100%", objectFit: "cover" }}
            />
          </div>
        )}
        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            color: "#800020",
            margin: "0 0 0.75rem",
          }}
        >
          {collection.title}
        </h1>
        {collection.description && (
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "1rem",
              color: "#6B6B6B",
              maxWidth: "640px",
              margin: "0 auto",
            }}
          >
            {collection.description}
          </p>
        )}
      </div>

      {/* Products grid with infinite/paginated scroll */}
      <Pagination connection={collection.products}>
        {({
          nodes,
          isLoading,
          PreviousLink,
          NextLink,
        }: {
          nodes: Array<{
            id: string;
            handle: string;
            title: string;
            vendor: string;
            availableForSale: boolean;
            featuredImage?: { url: string; altText?: string | null; width?: number; height?: number } | null;
            priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
          }>;
          isLoading: boolean;
          PreviousLink: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
          NextLink: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
        }) => (
          <>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <PreviousLink className="btn-secondary">
                {isLoading ? "Loading…" : "← Load previous"}
              </PreviousLink>
            </div>

            <div className="product-grid">
              {nodes.map((product) => (
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
                    {!product.availableForSale && (
                      <span style={{ fontSize: "0.75rem", color: "#999" }}>Out of stock</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <NextLink className="btn-primary">
                {isLoading ? "Loading…" : "Load more →"}
              </NextLink>
            </div>
          </>
        )}
      </Pagination>
    </div>
  );
}
