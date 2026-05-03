import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PromoHeader from "@/components/PromoHeader";
import Header from "@/components/Header";
import ContactSection from "@/components/ContactSection";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  "All",
  "skin",
  "hair",
  "supplements",
  "makeup",
  "perfume",
  "bath and body",
  "baby and mother",
  "others",
];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <PromoHeader />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Our Products
        </h1>
        <p className="text-muted-foreground mb-8">
          Discover premium beauty & wellness essentials curated for you.
        </p>

        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {error && (
          <div className="text-center py-16 text-destructive">
            Something went wrong loading products. Please try again.
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && products && products.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No products found in this category.
          </div>
        )}

        {!isLoading && !error && products && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <ContactSection />
    </div>
  );
};

export default Products;
