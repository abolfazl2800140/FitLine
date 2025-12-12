import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupplementCard, SupplementCardSkeleton } from "@/components/ui/supplement-card";
import { translations, formatPrice, toPersianNumber } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, ShoppingCart, X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const categories = [
  { value: "all", label: translations.store.categories.all },
  { value: "protein", label: translations.store.categories.protein },
  { value: "bcaa", label: translations.store.categories.bcaa },
  { value: "creatine", label: translations.store.categories.creatine },
  { value: "vitamins", label: translations.store.categories.vitamins },
  { value: "preworkout", label: translations.store.categories.preworkout },
  { value: "fatBurner", label: translations.store.categories.fatBurner },
];

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const { toast } = useToast();

  const { data: supplements, isLoading } = useQuery<any[]>({
    queryKey: ["/api/supplements"],
  });

  const { data: cart } = useQuery<any[]>({
    queryKey: ["/api/cart"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (supplementId: string) => {
      return apiRequest("POST", "/api/cart", { supplementId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "به سبد اضافه شد",
        description: "محصول به سبد خرید شما اضافه شد",
      });
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        return apiRequest("DELETE", `/api/cart/${itemId}`, undefined);
      }
      return apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const filteredSupplements = supplements?.filter((supp: any) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesName = supp.name?.toLowerCase().includes(searchLower);
      const matchesBrand = supp.brand?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesBrand) return false;
    }
    if (category !== "all" && supp.category !== category) return false;
    return true;
  }) || [];

  const cartItems = cart || [];
  const cartTotal = cartItems.reduce((sum: number, item: any) => {
    const price = parseFloat(item.supplement?.price || 0);
    return sum + (price * (item.quantity || 1));
  }, 0);
  const cartCount = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

  return (
    <div>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
        <div className="container px-4 md:px-6 py-4 flex items-center justify-between relative">
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-primary-foreground hover:bg-white/20"
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge
                    className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-white text-primary"
                  >
                    {toPersianNumber(cartCount)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
          </Sheet>
          <span className="text-lg italic font-semibold text-primary-foreground">FitLine</span>
          <div className="w-10" />
        </div>
      </div>
      {/* Spacer for fixed header */}
      <div className="h-14" />

      <div className="container px-4 md:px-6 py-6">
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetContent side="left" className="w-full sm:max-w-md flex flex-col">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {translations.store.cart}
              </SheetTitle>
            </SheetHeader>

            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">{translations.store.emptyCart}</p>
                <p className="text-muted-foreground mb-4 text-sm">
                  محصولات مورد نظر خود را به سبد اضافه کنید
                </p>
                <Button
                  variant="outline"
                  onClick={() => setCartOpen(false)}
                >
                  {translations.store.continueShopping}
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 -mx-6 px-6">
                  <div className="space-y-4 py-4">
                    {cartItems.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex gap-3"
                        data-testid={`cart-item-${item.id}`}
                      >
                        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {item.supplement?.image ? (
                            <img
                              src={item.supplement.image}
                              alt={item.supplement.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">
                            {item.supplement?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.supplement?.brand}
                          </p>
                          <p className="text-sm font-bold text-primary mt-1">
                            {formatPrice(item.supplement?.price || 0)} {translations.coaches.toman}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => updateCartMutation.mutate({ itemId: item.id, quantity: 0 })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateCartMutation.mutate({
                                itemId: item.id,
                                quantity: Math.max(0, (item.quantity || 1) - 1)
                              })}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {toPersianNumber(item.quantity || 1)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateCartMutation.mutate({
                                itemId: item.id,
                                quantity: (item.quantity || 1) + 1
                              })}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <SheetFooter className="flex-col border-t pt-4">
                  <div className="flex items-center justify-between w-full mb-4">
                    <span className="text-muted-foreground">{translations.store.total}:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(cartTotal)} {translations.coaches.toman}
                    </span>
                  </div>
                  <Button
                    className="w-full glow-green"
                    size="lg"
                    data-testid="button-checkout"
                  >
                    {translations.store.checkout}
                  </Button>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجوی محصول..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
            data-testid="input-search-supplements"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
        {categories.map((cat) => (
          <Badge
            key={cat.value}
            variant={category === cat.value ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setCategory(cat.value)}
            data-testid={`badge-category-${cat.value}`}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <SupplementCardSkeleton key={i} />
          ))
        ) : filteredSupplements.length > 0 ? (
          filteredSupplements.map((supp: any) => (
            <SupplementCard
              key={supp.id}
              id={supp.id}
              name={supp.name}
              brand={supp.brand}
              image={supp.image}
              price={supp.price}
              originalPrice={supp.originalPrice}
              rating={supp.rating || 0}
              reviewCount={supp.reviewCount || 0}
              inStock={(supp.stock || 0) > 0}
              isInCart={cartItems.some((item: any) => item.supplementId === supp.id)}
              onAddToCart={() => addToCartMutation.mutate(supp.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">محصولی یافت نشد</h3>
            <p className="text-muted-foreground mb-4">
              با تغییر فیلترها دوباره جستجو کنید
            </p>
            <Button variant="outline" onClick={() => { setSearch(""); setCategory("all"); }}>
              پاک کردن فیلترها
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
