/**
 * bulk-product-upload — Multi-action edge function for bulk product operations.
 *
 * Supports three actions:
 *   1. "categorize"            — AI-categorize raw products (name/SKU/price → category/brand/imagePrompt)
 *   2. "generate-image"        — Generate a product image prompt/placeholder
 *   3. "create-shopify-product" — Create a product in Shopify + upsert into Supabase for AI memory
 *
 * Protected by JWT + admin role check.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ─── Constants ─── */

const SHOPIFY_STORE_DOMAIN = "lovable-project-milns.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";

/* ─── Category Detection Keywords ─── */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Skincare: [
    "serum", "moisturizer", "cleanser", "toner", "cream", "lotion", "mask",
    "exfoliant", "peel", "retinol", "hyaluronic", "niacinamide", "vitamin c",
    "face wash", "micellar", "essence", "ampoule", "emulsion",
  ],
  "Sun Care": [
    "sunscreen", "spf", "sun protection", "sunblock", "uv", "solar",
  ],
  Haircare: [
    "shampoo", "conditioner", "hair oil", "hair mask", "hair serum",
    "scalp", "anti-dandruff", "hair loss", "keratin", "hair treatment",
  ],
  "Body Care": [
    "body lotion", "body wash", "body cream", "shower gel", "hand cream",
    "foot cream", "body oil", "deodorant", "body scrub",
  ],
  Makeup: [
    "foundation", "concealer", "mascara", "lipstick", "eyeshadow", "blush",
    "primer", "powder", "eyeliner", "lip gloss", "bronzer", "highlighter",
  ],
  Fragrance: [
    "perfume", "eau de", "cologne", "fragrance", "parfum", "body mist",
  ],
  Supplements: [
    "supplement", "vitamin", "collagen", "omega", "probiotic", "capsule",
    "tablet", "biotin",
  ],
  "Baby Care": [
    "baby", "infant", "diaper", "nappy", "baby oil", "baby cream",
    "baby shampoo", "baby wash",
  ],
  "Men's Care": [
    "men", "shaving", "beard", "aftershave", "men's",
  ],
  "Oral Care": [
    "toothpaste", "mouthwash", "dental", "oral", "teeth", "toothbrush",
  ],
  Dermocosmetics: [
    "derma", "dermo", "pharmaceutical", "medical grade", "prescription",
    "clinical strength",
  ],
};

/* ─── Known Brand Patterns ─── */

const BRAND_PATTERNS: Record<string, string[]> = {
  "La Roche-Posay": ["la roche", "laroche", "roche posay"],
  Vichy: ["vichy"],
  Bioderma: ["bioderma"],
  CeraVe: ["cerave"],
  Eucerin: ["eucerin"],
  "The Ordinary": ["ordinary"],
  Avène: ["avene", "avène"],
  SVR: ["svr"],
  Uriage: ["uriage"],
  Ducray: ["ducray"],
  Nuxe: ["nuxe"],
  Sesderma: ["sesderma"],
  Mustela: ["mustela"],
  "A-Derma": ["a-derma", "aderma"],
  Klorane: ["klorane"],
  Neutrogena: ["neutrogena"],
  "Garnier": ["garnier"],
};

/* ─── Helpers ─── */

function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "Skincare"; // Default fallback
}

function detectBrand(name: string): string {
  const lower = name.toLowerCase();
  for (const [brand, patterns] of Object.entries(BRAND_PATTERNS)) {
    if (patterns.some((p) => lower.includes(p))) {
      return brand;
    }
  }
  // Try to extract brand from the first word(s)
  const words = name.split(/\s+/);
  return words[0] || "Unknown";
}

function generateImagePrompt(name: string, category: string): string {
  return `Professional product photography of ${name}, ${category} product, clean white background, studio lighting, luxury cosmetic packaging, high-end beauty product, 4k, commercial photography`;
}

function generateHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ─── Shopify Admin API Helper ─── */

async function shopifyAdminFetch(
  accessToken: string,
  endpoint: string,
  method = "GET",
  body?: unknown,
) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Shopify Admin API [${res.status}]: ${errText}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

/* ─── Action Handlers ─── */

interface RawProduct {
  sku: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
}

interface ProcessedProduct {
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  costPrice: number;
  imagePrompt: string;
  status: "pending";
}

async function handleCategorize(products: RawProduct[]) {
  const processed: ProcessedProduct[] = products.map((p) => {
    const category = detectCategory(p.name);
    const brand = detectBrand(p.name);
    const imagePrompt = generateImagePrompt(p.name, category);
    const price = p.sellingPrice || p.costPrice * 1.5; // Fallback markup

    return {
      sku: p.sku,
      name: p.name,
      category,
      brand,
      price,
      costPrice: p.costPrice,
      imagePrompt,
      status: "pending" as const,
    };
  });

  // Build summary
  const categories: Record<string, number> = {};
  const brands: Record<string, number> = {};
  for (const p of processed) {
    categories[p.category] = (categories[p.category] || 0) + 1;
    brands[p.brand] = (brands[p.brand] || 0) + 1;
  }

  return {
    products: processed,
    summary: {
      total: processed.length,
      categories,
      brands,
    },
  };
}

async function handleGenerateImage(
  productName: string,
  category: string,
  imagePrompt: string,
) {
  // Use Gemini if available, otherwise return a structured placeholder
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate a concise, SEO-friendly product image alt text for: ${productName} (${category}). Return only the alt text, nothing else.`,
              }],
            }],
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const altText = data?.candidates?.[0]?.content?.parts?.[0]?.text || productName;

        // Return placeholder image URL with metadata
        // In production, this would integrate with an image generation service
        return {
          imageUrl: `https://placehold.co/800x1000/F8F8FF/800020?text=${encodeURIComponent(productName.slice(0, 30))}`,
          altText: altText.trim(),
        };
      }
    } catch (err) {
      console.error("Gemini API error:", err);
    }
  }

  // Fallback: structured placeholder
  return {
    imageUrl: `https://placehold.co/800x1000/F8F8FF/800020?text=${encodeURIComponent(productName.slice(0, 30))}`,
    altText: `${productName} - ${category} product`,
  };
}

async function handleCreateShopifyProduct(
  product: {
    title: string;
    body: string;
    vendor: string;
    product_type: string;
    tags: string;
    price: string;
    sku: string;
    imageUrl?: string;
  },
  shopifyToken: string,
  serviceClient: ReturnType<typeof createClient>,
) {
  // Create product in Shopify via REST Admin API
  const shopifyPayload = {
    product: {
      title: product.title,
      body_html: `<p>${product.body}</p>`,
      vendor: product.vendor,
      product_type: product.product_type,
      tags: product.tags,
      status: "active",
      variants: [
        {
          price: product.price,
          sku: product.sku,
          inventory_management: "shopify",
          inventory_quantity: 10,
        },
      ],
      ...(product.imageUrl
        ? {
          images: [
            {
              src: product.imageUrl,
              alt: product.title,
            },
          ],
        }
        : {}),
    },
  };

  const shopifyResult = await shopifyAdminFetch(
    shopifyToken,
    "products.json",
    "POST",
    shopifyPayload,
  );

  const shopifyProduct = shopifyResult?.product;
  const shopifyId = shopifyProduct?.id;
  const handle = shopifyProduct?.handle || generateHandle(product.title);

  // Upsert into Supabase products table for AI memory
  const { error: upsertError } = await serviceClient
    .from("products")
    .upsert(
      {
        name: product.title,
        title: product.title,
        brand: product.vendor,
        category: product.product_type,
        description: product.body,
        price: parseFloat(product.price || "0"),
        handle,
        image_url: product.imageUrl || null,
        tags: (product.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
        availability_status: "in_stock",
        in_stock: true,
      },
      { onConflict: "handle", ignoreDuplicates: false },
    );

  if (upsertError) {
    console.error("Supabase upsert error:", upsertError);
    // Don't fail the whole request — Shopify product was already created
  }

  return {
    success: true,
    shopifyId,
    handle,
  };
}

/* ─── Main Handler ─── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN");

    // Auth check — JWT required
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client for DB writes
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse body
    const body = await req.json();
    const { action } = body;

    let result: unknown;

    switch (action) {
      case "categorize": {
        const { products } = body;
        if (!Array.isArray(products) || products.length === 0) {
          return new Response(
            JSON.stringify({ error: "No products provided. Send { action: 'categorize', products: [...] }" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        result = await handleCategorize(products);
        break;
      }

      case "generate-image": {
        const { productName, category, imagePrompt } = body;
        if (!productName) {
          return new Response(
            JSON.stringify({ error: "productName is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        result = await handleGenerateImage(
          productName,
          category || "Skincare",
          imagePrompt || "",
        );
        break;
      }

      case "create-shopify-product": {
        if (!SHOPIFY_ACCESS_TOKEN) {
          return new Response(
            JSON.stringify({ error: "SHOPIFY_ACCESS_TOKEN not configured" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        const { product } = body;
        if (!product?.title) {
          return new Response(
            JSON.stringify({ error: "product.title is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        result = await handleCreateShopifyProduct(product, SHOPIFY_ACCESS_TOKEN, serviceClient);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: "${action}". Supported: categorize, generate-image, create-shopify-product` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("bulk-product-upload error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
