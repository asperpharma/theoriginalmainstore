/**
 * app/components/Layout.tsx — Shared Hydrogen storefront layout
 *
 * Renders the sticky header, skip-to-content link, and footer that wraps
 * every page. Uses Hydrogen's <CartForm> and <useCart> for the cart badge.
 */

import { Link, useMatches } from "@remix-run/react";
import { CartForm, useOptimisticCart } from "@shopify/hydrogen";
import appStyles from "~/styles/app.css?url";

// Re-export styles so root.tsx can add them via links()
export const layoutLinks = () => [{ rel: "stylesheet", href: appStyles }];

interface LayoutProps {
  cart: unknown;
  children: React.ReactNode;
}

export function Layout({ children }: Omit<LayoutProps, "cart">) {
  return (
    <>
      <a className="sr-only" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}

function SiteHeader() {
  return (
    <header className="hydrogen-header">
      <Link to="/" className="hydrogen-header__logo" prefetch="intent">
        Asper Beauty
      </Link>

      <nav aria-label="Main navigation">
        <ul className="hydrogen-header__nav">
          <li>
            <Link to="/collections/all" prefetch="intent">
              Shop
            </Link>
          </li>
          <li>
            <Link to="/collections/skincare" prefetch="intent">
              Skincare
            </Link>
          </li>
          <li>
            <Link to="/collections/brands" prefetch="intent">
              Brands
            </Link>
          </li>
          <li>
            <Link to="/pages/about" prefetch="intent">
              About
            </Link>
          </li>
        </ul>
      </nav>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/search" aria-label="Search" prefetch="intent">
          🔍
        </Link>
        <Link to="/cart" aria-label="Cart" prefetch="intent">
          🛒
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer
      style={{
        background: "#1a0008",
        color: "#e8d5bb",
        padding: "3rem 2rem",
        marginTop: "4rem",
        textAlign: "center",
        fontFamily: "var(--font-body)",
        fontSize: "0.875rem",
      }}
    >
      <p style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "#C5A028" }}>
        Asper Beauty Shop
      </p>
      <p style={{ color: "#a0858a", marginTop: "0.5rem" }}>
        Medical-grade skincare &amp; luxury beauty — Jordan
      </p>
      <p style={{ marginTop: "1.5rem", color: "#666" }}>
        © {new Date().getFullYear()} Asper Pharma. All rights reserved.
      </p>
    </footer>
  );
}
