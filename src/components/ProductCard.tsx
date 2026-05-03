import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

interface ProductCardProps {
  product: Tables<"products">;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-300">
      <div className="aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {product.brand}
        </p>
        <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <span className="text-primary font-bold text-base md:text-lg">
            ${product.price.toFixed(2)}
          </span>
          {product.in_stock === false && (
            <Badge variant="destructive" className="text-[10px]">
              Out of stock
            </Badge>
          )}
        </div>
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
