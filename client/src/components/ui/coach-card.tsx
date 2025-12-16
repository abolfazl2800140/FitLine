import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, Clock, BadgeCheck, ArrowLeft } from "lucide-react";
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
  compact?: boolean;
  hideBookButton?: boolean;
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
  compact = false,
  hideBookButton = false,
  className,
}: CoachCardProps) {
  const ratingNum = typeof rating === "string" ? parseFloat(rating) : rating;

  if (compact) {
    return (
      <Link href={`/coaches/${id}`}>
        <Card
          className={cn(
            "overflow-hidden group cursor-pointer border border-border/50 bg-card hover:shadow-md transition-all",
            className
          )}
          data-testid={`card-coach-${id}`}
        >
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={avatar || undefined} alt={name} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isVerified && (
                  <div className="absolute -bottom-0.5 -left-0.5 bg-primary rounded-full p-0.5">
                    <BadgeCheck className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-sm mb-1 line-clamp-1">{name}</h3>
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 mb-2">
                {specialty}
              </Badge>
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="font-bold">{toPersianNumber(ratingNum.toFixed(1))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden card-sport interactive-card group cursor-pointer border-0 bg-card/80",
        className
      )}
      data-testid={`card-coach-${id}`}
    >
      <Link href={`/coaches/${id}`}>
        <CardContent className="p-5">
          <div className="flex flex-col items-center text-center">
            {/* Avatar with glow effect */}
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Avatar className="h-24 w-24 border-3 border-primary/30 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all duration-300">
                <AvatarImage src={avatar || undefined} alt={name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-bold">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isVerified && (
                <div className="absolute -bottom-1 -left-1 bg-primary rounded-full p-1 shadow-lg shadow-primary/30">
                  <BadgeCheck className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">
              {name}
            </h3>

            {/* Specialty Badge */}
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-medium rounded-full">
              {specialty}
            </Badge>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 bg-muted/50 px-3 py-1.5 rounded-full">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold">{toPersianNumber(ratingNum.toFixed(1))}</span>
              <span className="text-muted-foreground text-xs">
                ({toPersianNumber(reviewCount)})
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm mb-5">
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg">{toPersianNumber(experience)}</span>
                <span className="text-muted-foreground text-xs">{translations.coaches.years}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg">{toPersianNumber(clientCount)}</span>
                <span className="text-muted-foreground text-xs">{translations.coaches.clients}</span>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="w-full pt-4 border-t border-border/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground">{translations.coaches.pricePerSession}</span>
                <span className="font-black text-xl text-primary">
                  {formatPrice(pricePerSession)}
                  <span className="text-xs font-normal text-muted-foreground mr-1">{translations.coaches.toman}</span>
                </span>
              </div>
              {!hideBookButton && (
                <Button
                  className="w-full glow-green group/btn font-bold"
                  data-testid={`button-book-coach-${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // TODO: Open booking modal
                  }}
                >
                  {translations.coaches.bookSession}
                  <ArrowLeft className="h-4 w-4 mr-2 rtl-flip group-hover/btn:-translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export function CoachCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 bg-card/80">
      <CardContent className="p-5">
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-muted skeleton-shimmer mb-4" />
          <div className="h-5 w-28 bg-muted skeleton-shimmer rounded-lg mb-2" />
          <div className="h-6 w-20 bg-muted skeleton-shimmer rounded-full mb-4" />
          <div className="h-8 w-24 bg-muted skeleton-shimmer rounded-full mb-4" />
          <div className="flex gap-6 mb-5">
            <div className="h-12 w-12 bg-muted skeleton-shimmer rounded-lg" />
            <div className="h-12 w-12 bg-muted skeleton-shimmer rounded-lg" />
          </div>
          <div className="w-full pt-4 border-t border-border/50">
            <div className="h-4 w-full bg-muted skeleton-shimmer rounded mb-4" />
            <div className="h-11 w-full bg-muted skeleton-shimmer rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
