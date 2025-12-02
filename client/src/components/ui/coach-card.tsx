import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, Clock, BadgeCheck } from "lucide-react";
import { translations, formatPrice, toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface CoachCardProps {
  id: string;
  name: string;
  avatar?: string | null;
  specialty: string;
  experience: number;
  pricePerSession: string | number;
  rating: string | number;
  reviewCount: number;
  clientCount: number;
  isVerified?: boolean;
  className?: string;
}

export function CoachCard({
  id,
  name,
  avatar,
  specialty,
  experience,
  pricePerSession,
  rating,
  reviewCount,
  clientCount,
  isVerified = false,
  className,
}: CoachCardProps) {
  const ratingNum = typeof rating === "string" ? parseFloat(rating) : rating;

  return (
    <Card 
      className={cn(
        "overflow-hidden hover-elevate active-elevate-2 transition-all duration-300 group cursor-pointer",
        className
      )}
      data-testid={`card-coach-${id}`}
    >
      <Link href={`/coaches/${id}`}>
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage src={avatar || undefined} alt={name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isVerified && (
                <div className="absolute -bottom-1 -left-1 bg-primary rounded-full p-0.5">
                  <BadgeCheck className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>

            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            
            <Badge variant="secondary" className="mb-3 text-xs">
              {specialty}
            </Badge>

            <div className="flex items-center gap-1 mb-3">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{toPersianNumber(ratingNum.toFixed(1))}</span>
              <span className="text-muted-foreground text-sm">
                ({toPersianNumber(reviewCount)} {translations.coaches.reviews})
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{toPersianNumber(experience)} {translations.coaches.years}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{toPersianNumber(clientCount)} {translations.coaches.clients}</span>
              </div>
            </div>

            <div className="w-full pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{translations.coaches.pricePerSession}</span>
                <span className="font-bold text-primary">
                  {formatPrice(pricePerSession)} {translations.coaches.toman}
                </span>
              </div>
              <Button className="w-full" data-testid={`button-book-coach-${id}`}>
                {translations.coaches.bookSession}
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export function CoachCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-muted skeleton-shimmer mb-3" />
          <div className="h-5 w-24 bg-muted skeleton-shimmer rounded mb-2" />
          <div className="h-5 w-16 bg-muted skeleton-shimmer rounded mb-3" />
          <div className="h-4 w-32 bg-muted skeleton-shimmer rounded mb-3" />
          <div className="h-4 w-28 bg-muted skeleton-shimmer rounded mb-4" />
          <div className="w-full pt-3 border-t border-border">
            <div className="h-4 w-full bg-muted skeleton-shimmer rounded mb-3" />
            <div className="h-9 w-full bg-muted skeleton-shimmer rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
