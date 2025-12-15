import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, toPersianNumber } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Package,
  Info,
  MessageSquare,
  Loader2,
} from "lucide-react";

const categoryLabels: Record<string, string> = {
  protein: "پروتئین",
  bcaa: "BCAA",
  creatine: "کراتین",
  vitamins: "ویتامین",
  preworkout: "پیش تمرین",
  fatBurner: "چربی سوز",
};

export default function SupplementDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const { toast } = useToast();

  const { data: supplement, isLoading } = useQuery<any>({
    queryKey: [`/api/supplements/${params.id}`],
    enabled: !!params.id,
  });

  const { data: reviews } = useQuery<any[]>({
    queryKey: [`/api/supplements/${params.id}/reviews`],
    enabled: !!params.id,
  });

  const { data: canReviewData } = useQuery<{ canReview: boolean }>({
    queryKey: [`/api/supplements/${params.id}/can-review`],
    enabled: !!params.id,
  });

  const { data: cart } = useQuery<any[]>({
    queryKey: ["/api/cart"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", {
        supplementId: params.id,
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "به سبد اضافه شد",
        description: `${quantity} عدد ${supplement?.name} به سبد خرید اضافه شد`,
      });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/supplements/${params.id}/reviews`, {
        rating: reviewRating,
        comment: reviewText,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/supplements/${params.id}/reviews`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/supplements/${params.id}`],
      });
      setReviewText("");
      setReviewRating(5);
      toast({
        title: "نظر ثبت شد",
        description: "نظر شما با موفقیت ثبت شد",
      });
    },
  });

  const isInCart = cart?.some((item: any) => item.supplementId === params.id);
  const inStock = (supplement?.stock || 0) > 0;
  const discount = supplement?.originalPrice
    ? Math.round(
        ((supplement.originalPrice - supplement.price) /
          supplement.originalPrice) *
          100
      )
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="h-14 bg-primary" />
        <div className="container max-w-2xl px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="aspect-square bg-muted rounded-2xl" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!supplement) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">محصول یافت نشد</p>
          <Button onClick={() => setLocation("/store")}>
            بازگشت به فروشگاه
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32" dir="rtl">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
        <div className="flex items-center gap-3 px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/store")}
            className="rounded-full text-primary-foreground hover:bg-white/20"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary-foreground line-clamp-1">
            {supplement.name}
          </h1>
        </div>
      </div>
      <div className="h-14" />

      <div className="container max-w-2xl px-4 py-6">
        {/* Product Image */}
        <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden mb-6">
          {supplement.image ? (
            <img
              src={supplement.image}
              alt={supplement.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-4 right-4 bg-red-500">
              {toPersianNumber(discount)}% تخفیف
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4 mb-6 text-right">
          <div>
            <Badge variant="outline" className="mb-2">
              {categoryLabels[supplement.category] || supplement.category}
            </Badge>
            <h1 className="text-2xl font-bold">{supplement.name}</h1>
            <p className="text-muted-foreground">{supplement.brand}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 flex-row-reverse justify-end">
            <span className="text-sm text-muted-foreground">
              ({toPersianNumber(supplement.reviewCount || 0)} نظر)
            </span>
            <div className="flex items-center gap-1 flex-row-reverse">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(supplement.rating || 0)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 flex-row-reverse justify-end">
            {supplement.originalPrice &&
              supplement.originalPrice > supplement.price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(supplement.originalPrice)}
                </span>
              )}
            <span className="text-sm text-muted-foreground">تومان</span>
            <span className="text-3xl font-bold text-primary">
              {formatPrice(supplement.price)}
            </span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {inStock ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">موجود در انبار</span>
              </>
            ) : (
              <>
                <Package className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">ناموجود</span>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="description" className="gap-1">
              <Info className="h-4 w-4" />
              توضیحات
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="gap-1">
              <Package className="h-4 w-4" />
              ارزش غذایی
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1">
              <MessageSquare className="h-4 w-4" />
              نظرات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4">
            <Card>
              <CardContent className="p-4" dir="rtl">
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  {(supplement.description || "توضیحاتی برای این محصول ثبت نشده است.")
                    .split('\n\n')
                    .map((paragraph: string, idx: number) => (
                      <div key={idx} className="text-right">
                        {paragraph.split('\n').map((line: string, lineIdx: number) => (
                          <p key={lineIdx} className={line.startsWith('•') ? 'pr-2' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-4">
            <Card>
              <CardContent className="p-4">
                {supplement.nutritionFacts ? (
                  <div className="space-y-3" dir="rtl">
                    {Object.entries(supplement.nutritionFacts).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    اطلاعات تغذیه‌ای ثبت نشده است
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-4">
            {/* Write Review - Only for buyers */}
            {canReviewData?.canReview ? (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold text-right">ثبت نظر</h3>
                  <div className="flex items-center gap-1 justify-end flex-row-reverse">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            star <= reviewRating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="نظر خود را بنویسید..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    className="text-right"
                    dir="rtl"
                  />
                  <Button
                    onClick={() => submitReviewMutation.mutate()}
                    disabled={
                      !reviewText.trim() || submitReviewMutation.isPending
                    }
                    className="w-full"
                  >
                    {submitReviewMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "ثبت نظر"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {/* Reviews List */}
            {reviews && reviews.length > 0 ? (
              reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 flex-row-reverse">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">
                            {review.user?.fullName || "کاربر"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground text-right">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">هنوز نظری ثبت نشده</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t p-4">
        <div className="container max-w-2xl flex items-center gap-4 flex-row-reverse">
          {/* Add to Cart Button */}
          <Button
            className="flex-1 gap-2"
            size="lg"
            onClick={() => addToCartMutation.mutate()}
            disabled={!inStock || addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isInCart ? (
              <>
                <Check className="h-5 w-5" />
                در سبد خرید
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                افزودن به سبد
              </>
            )}
          </Button>

          {/* Quantity Selector */}
          <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
              disabled={!inStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">
              {toPersianNumber(quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!inStock}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
