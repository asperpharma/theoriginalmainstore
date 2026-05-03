/**
 * app/routes/cart.tsx — Cart page + CartForm action handler
 *
 * Handles add / update / remove cart actions and renders the cart UI.
 * Uses Hydrogen's CartForm component for all mutations.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, Link } from "@remix-run/react";
import { CartForm, Image, Money } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import { getAsperContext } from "~/lib/context";

// ── Meta ──────────────────────────────────────────────────────────────────────

export const meta: MetaFunction = () => [{ title: "Your Cart — Asper Beauty" }];

// ── Cart query (for SSR) ──────────────────────────────────────────────────────

const CART_QUERY = `#graphql
  query Cart($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount { amount currencyCode }
        totalAmount { amount currencyCode }
        totalTaxAmount { amount currencyCode }
      }
      lines(first: 100) {
        nodes {
          id
          quantity
          cost { totalAmount { amount currencyCode } }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions { name value }
              product { title handle }
              image { url altText width height }
              price { amount currencyCode }
            }
          }
        }
      }
    }
  }
` as const;

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storefront } = getAsperContext(context);
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cartId = cookieHeader.match(/cartId=([^;]+)/)?.[1];

  if (!cartId) return json({ cart: null });

  const { cart } = await storefront.query(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return json({ cart });
}

// ── Action ────────────────────────────────────────────────────────────────────

export async function action({ request, context }: ActionFunctionArgs) {
  const { cart } = getAsperContext(context).storefront as unknown as {
    cart: {
      create: (args: unknown) => Promise<{ cart: { id: string; checkoutUrl: string } }>;
      addLines: (args: unknown) => Promise<{ cart: { id: string } }>;
      updateLines: (args: unknown) => Promise<{ cart: { id: string } }>;
      removeLines: (args: unknown) => Promise<{ cart: { id: string } }>;
    };
  };

  const formData = await request.formData();
  const { action: cartAction, inputs } = CartForm.getFormInput(formData);

  let result: { cart?: { id?: string } } = {};

  switch (cartAction) {
    case CartForm.ACTIONS.LinesAdd: {
      result = await cart.addLines(inputs);
      break;
    }
    case CartForm.ACTIONS.LinesUpdate: {
      result = await cart.updateLines(inputs);
      break;
    }
    case CartForm.ACTIONS.LinesRemove: {
      result = await cart.removeLines(inputs);
      break;
    }
    default:
      throw new Response(`Cart action ${cartAction} not handled`, { status: 400 });
  }

  const headers = new Headers();
  if (result?.cart?.id) {
    headers.append("Set-Cookie", `cartId=${result.cart.id}; Path=/; SameSite=Lax; HttpOnly`);
  }

  return json({ ok: true }, { headers });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { cart } = useLoaderData<typeof loader>();

  if (!cart || cart.totalQuantity === 0) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Montserrat, sans-serif",
          gap: "1.5rem",
          padding: "4rem 2rem",
        }}
      >
        <span style={{ fontSize: "4rem" }}>🛒</span>
        <h2
          style={{
            fontFamily: "Playfair Display, serif",
            color: "#800020",
            fontSize: "2rem",
            margin: 0,
          }}
        >
          Your cart is empty
        </h2>
        <p style={{ color: "#6B6B6B", maxWidth: "400px", textAlign: "center" }}>
          Discover our curated collection of clinical skincare and beauty products.
        </p>
        <Link to="/collections/all" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
      <h1
        style={{
          fontFamily: "Playfair Display, serif",
          color: "#800020",
          fontSize: "2rem",
          marginBottom: "2rem",
        }}
      >
        Your Cart ({cart.totalQuantity}{" "}
        {cart.totalQuantity === 1 ? "item" : "items"})
      </h1>

      {/* Line items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {cart.lines.nodes.map((line: {
          id: string;
          quantity: number;
          cost: { totalAmount: { amount: string; currencyCode: string } };
          merchandise: {
            id: string;
            title: string;
            selectedOptions: Array<{ name: string; value: string }>;
            product: { title: string; handle: string };
            image?: { url: string; altText?: string | null; width?: number; height?: number } | null;
            price: { amount: string; currencyCode: string };
          };
        }) => (
          <div
            key={line.id}
            className="neu-card"
            style={{
              padding: "1.25rem",
              display: "grid",
              gridTemplateColumns: "80px 1fr auto",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            {/* Image */}
            {line.merchandise.image ? (
              <Image
                data={line.merchandise.image}
                aspectRatio="1/1"
                sizes="80px"
                style={{ borderRadius: "0.5rem" }}
              />
            ) : (
              <div
                style={{
                  width: "80px",
                  aspectRatio: "1",
                  background: "#ede8f0",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                🧴
              </div>
            )}

            {/* Details */}
            <div>
              <Link
                to={`/products/${line.merchandise.product.handle}`}
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "1rem",
                  color: "#333",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {line.merchandise.product.title}
              </Link>
              {line.merchandise.selectedOptions
                .filter((o) => o.value !== "Default Title")
                .map((option) => (
                  <p
                    key={option.name}
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "0.8125rem",
                      color: "#6B6B6B",
                      margin: "0.25rem 0 0",
                    }}
                  >
                    {option.name}: {option.value}
                  </p>
                ))}

              {/* Qty controls */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "0.75rem" }}>
                <CartForm
                  route="/cart"
                  action={CartForm.ACTIONS.LinesUpdate}
                  inputs={{ lines: [{ id: line.id, quantity: Math.max(0, line.quantity - 1) }] }}
                >
                  <button
                    type="submit"
                    style={{
                      width: "28px",
                      height: "28px",
                      border: "1.5px solid #ddd",
                      borderRadius: "50%",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "1rem",
                    }}
                  >
                    −
                  </button>
                </CartForm>
                <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, minWidth: "1.5rem", textAlign: "center" }}>
                  {line.quantity}
                </span>
                <CartForm
                  route="/cart"
                  action={CartForm.ACTIONS.LinesUpdate}
                  inputs={{ lines: [{ id: line.id, quantity: line.quantity + 1 }] }}
                >
                  <button
                    type="submit"
                    style={{
                      width: "28px",
                      height: "28px",
                      border: "1.5px solid #ddd",
                      borderRadius: "50%",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "1rem",
                    }}
                  >
                    +
                  </button>
                </CartForm>
              </div>
            </div>

            {/* Price + remove */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, color: "#800020", fontSize: "1rem" }}>
                <Money data={line.cost.totalAmount} />
              </span>
              <CartForm
                route="/cart"
                action={CartForm.ACTIONS.LinesRemove}
                inputs={{ lineIds: [line.id] }}
              >
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#999",
                    fontSize: "0.8125rem",
                    fontFamily: "Montserrat, sans-serif",
                    padding: 0,
                  }}
                >
                  Remove
                </button>
              </CartForm>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div
        className="neu-card"
        style={{
          padding: "1.5rem",
          marginTop: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Montserrat, sans-serif" }}>
          <span style={{ color: "#6B6B6B" }}>Subtotal</span>
          <span style={{ fontWeight: 600 }}>
            <Money data={cart.cost.subtotalAmount} />
          </span>
        </div>
        {cart.cost.totalTaxAmount && (
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Montserrat, sans-serif", fontSize: "0.875rem" }}>
            <span style={{ color: "#6B6B6B" }}>Tax</span>
            <span>
              <Money data={cart.cost.totalTaxAmount} />
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Playfair Display, serif",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#800020",
            borderTop: "1px solid #e8e0e4",
            paddingTop: "0.75rem",
          }}
        >
          <span>Total</span>
          <Money data={cart.cost.totalAmount} />
        </div>
        <a
          href={cart.checkoutUrl}
          className="btn-primary"
          style={{ textAlign: "center", textDecoration: "none", marginTop: "0.5rem" }}
        >
          Proceed to Checkout →
        </a>
      </div>
    </div>
  );
}
