import { useState, useRef, useEffect } from "react";
import { Search, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  brand: string;
  tags: string[];
}

const Header = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-product-search", {
        body: { query: searchQuery },
      });

      if (error) throw error;
      setResults(data?.products || []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchProducts(value), 600);
  };

  return (
    <header className="w-full bg-background border-b border-border py-4 px-6 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Search Box */}
        <div ref={searchRef} className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          )}
          <Input
            type="search"
            placeholder="Ask AI to find products... e.g. 'something for dry skin'"
            value={query}
            onChange={handleInputChange}
            onFocus={() => results.length > 0 && setShowResults(true)}
            className="pl-10 pr-10 bg-secondary/50 border-border focus:border-primary transition-colors"
          />

          {/* Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-[420px] overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center gap-2 p-6 text-muted-foreground justify-center">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm">AI is finding the best products for you...</span>
                </div>
              ) : results.length > 0 ? (
                <div>
                  <div className="px-4 py-2 bg-muted/50 border-b border-border">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      AI found {results.length} product{results.length !== 1 ? "s" : ""} for "{query}"
                    </p>
                  </div>
                  {results.map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{product.brand} · {product.category}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary whitespace-nowrap">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No products found. Try a different search.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Logo - Centered */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Asper Shop
          </h2>
        </div>

        {/* Empty space for balance */}
        <div className="max-w-md"></div>
      </div>
    </header>
  );
};

export default Header;
