import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Check } from "lucide-react";
import { translations, formatPrice, toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useState } from "react";

interface SupplementCardProps {
  id: string;
  name: string;
  brand: string;
  image?: string | null;
  price: string | number;
  originalPrice?: string | number | null;
  rating: string | number;
  reviewCount: number;
  inStock?: boolean;
  isInCart?: boolean;
  onAddToCart?: () => void;
  className?: string;
}

export function SupplementCard({
  id,
  name,
  brand,
  image,
  price,
  originalPrice,
  rating,
  reviewCount,
  inStock = true,
  isInCart = false,
  onAddToCart,
  className,
}: SupplementCardProps) {
  const [inCart, setInCart] = useState(isInCart);
  const ratingNum = typeof rating === "string" ? parseFloat(rating) : rating;
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  const originalPriceNum = originalPrice 
    ? (typeof originalPrice === "string" ? parseFloat(originalPrice) : originalPrice)
    : null;
  
  const discount = originalPriceNum 
    ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart && inStock) {
      setInCart(true);
      onAddToCart?.();
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden hover-elevate active-elevate-2 transition-all duration-300 group cursor-pointer",
        className
      )}
      data-testid={`card-supplement-${id}`}
    >
      <Link href={`/store/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {discount > 0 && (
            <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-500">
              {toPersianNumber(discount)}% {translations.store.discount}
            </Badge>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-base">
                {translations.store.outOfStock}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{brand}</p>
          <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {name}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{toPersianNumber(ratingNum.toFixed(1))}</span>
            <span className="text-xs text-muted-foreground">
              ({toPersianNumber(reviewCount)})
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col">
              {originalPriceNum && originalPriceNum > priceNum && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(originalPriceNum)}
                </span>
              )}
              <span className="font-bold text-primary">
                {formatPrice(priceNum)} <span className="text-xs font-normal">{translations.coaches.toman}</span>
              </span>
            </div>

            <Button 
              size="sm"
              variant={inCart ? "secondary" : "default"}
              className={cn("h-8 gap-1", inCart && "pointer-events-none")}
              onClick={handleAddToCart}
              disabled={!inStock}
              data-testid={`button-add-cart-${id}`}
            >
              {inCart ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span className="text-xs">{translations.store.inCart}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span className="text-xs hidden sm:inline">{translations.store.addToCart}</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export function SupplementCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted skeleton-shimmer" />
      <CardContent className="p-4">
        <div className="h-3 w-16 bg-muted skeleton-shimmer rounded mb-1" />
        <div className="h-4 w-full bg-muted skeleton-shimmer rounded mb-1" />
        <div className="h-4 w-3/4 bg-muted skeleton-shimmer rounded mb-3" />
        <div className="h-4 w-20 bg-muted skeleton-shimmer rounded mb-3" />
        <div className="flex justify-between">
          <div className="h-5 w-24 bg-muted skeleton-shimmer rounded" />
          <div className="h-8 w-20 bg-muted skeleton-shimmer rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
