/**
 * app/root.tsx — Remix root module for the Hydrogen storefront
 *
 * Provides:
 *  - Google Fonts (Playfair Display, Montserrat, Tajawal)
 *  - Asper design-token CSS
 *  - Hydrogen <Analytics> provider
 *  - RTL support via <html lang> / <html dir>
 */

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/react";
import { Analytics } from "@shopify/hydrogen";
import { Layout, layoutLinks } from "~/components/Layout";

export const links: LinksFunction = () => [
  // Preconnect
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  // Google Fonts
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap",
  },
  // Asper storefront CSS (design tokens + neumorphic utilities)
  ...layoutLinks(),
];

export const meta: MetaFunction = () => [
  { charset: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { name: "theme-color", content: "#800020" },
];

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = context as { storefront: { i18n: { language: string; country: string } } };
  return {
    locale: storefront.i18n,
  };
}

export default function App() {
  return (
    <html lang="en" dir="ltr">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="template-hydrogen">
        <Analytics.Provider>
          <Layout>
            <Outlet />
          </Layout>
        </Analytics.Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message = isRouteErrorResponse(error)
    ? error.data
    : error instanceof Error
    ? error.message
    : "Unknown error";

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <title>{status} — Asper Beauty</title>
      </head>
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "Montserrat, sans-serif",
          background: "#F8F8FF",
          color: "#333",
        }}
      >
        <h1 style={{ fontFamily: "Playfair Display, serif", color: "#800020" }}>
          {status}
        </h1>
        <p>{String(message)}</p>
        <a href="/" style={{ color: "#800020", marginTop: "1rem" }}>
          ← Back to home
        </a>
        <Scripts />
      </body>
    </html>
  );
}
