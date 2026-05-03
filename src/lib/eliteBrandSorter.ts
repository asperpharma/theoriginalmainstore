/**
 * Elite Brand Sorter
 * Pins luxury brands (Dior, Lancôme, Estée Lauder, YSL) to the top of any
 * product feed, then returns remaining products in their original order.
 */

export const ELITE_BRANDS = [
  "Dior",
  "Christian Dior",
  "Lancôme",
  "Lancome",
  "Estée Lauder",
  "Estee Lauder",
  "Yves Saint Laurent",
  "YSL",
  "Saint Laurent",
] as const;

export type EliteBrand = (typeof ELITE_BRANDS)[number];

export interface SortableProduct {
  id: string;
  brand?: string | null;
  [key: string]: unknown;
}

/**
 * Returns true if the product's brand is one of the pinned elite luxury brands.
 * Case-insensitive, handles accent variants.
 */
export function isEliteBrand(brand: string | null | undefined): boolean {
  if (!brand) return false;
  const normalized = brand.trim().toLowerCase();
  return ELITE_BRANDS.some((elite) => elite.toLowerCase() === normalized);
}

/**
 * Sorts a product array so elite luxury brands appear first.
 * Within the elite group, order is preserved (stable sort).
 * Within the non-elite group, order is preserved.
 */
export function pinEliteBrandsToTop<T extends SortableProduct>(
  products: T[]
): T[] {
  const elite: T[] = [];
  const rest: T[] = [];

  for (const product of products) {
    if (isEliteBrand(product.brand)) {
      elite.push(product);
    } else {
      rest.push(product);
    }
  }

  return [...elite, ...rest];
}

/**
 * Splits a product array into elite and non-elite buckets without re-ordering.
 * Useful when you want to render them in separate UI zones.
 */
export function partitionByEliteBrand<T extends SortableProduct>(
  products: T[]
): { elite: T[]; rest: T[] } {
  const elite: T[] = [];
  const rest: T[] = [];

  for (const product of products) {
    if (isEliteBrand(product.brand)) {
      elite.push(product);
    } else {
      rest.push(product);
    }
  }

  return { elite, rest };
}
