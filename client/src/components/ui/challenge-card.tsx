import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, Zap, Check, Target } from "lucide-react";
import { translations, toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  id: string;
  title: string;
  description?: string | null;
  type: "weekly" | "monthly";
  goal: string;
  targetValue?: number | null;
  participantCount: number;
  startDate: string | Date;
  endDate: string | Date;
  coverImage?: string | null;
  progress?: number;
  isJoined?: boolean;
  compact?: boolean;
  onJoin?: () => void;
  className?: string;
}

export function ChallengeCard({
  id,
  title,
  description,
  type,
  goal,
  targetValue,
  participantCount,
  startDate,
  endDate,
  coverImage,
  progress = 0,
  isJoined = false,
  compact = false,
  onJoin,
  className,
}: ChallengeCardProps) {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  if (compact) {
    return (
      <Card 
        className={cn(
          "overflow-hidden border border-border/50 hover:shadow-md transition-all",
          className
        )}
        data-testid={`card-challenge-${id}`}
      >
        <div className="relative h-24 overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center">
              <Zap className="h-8 w-8 text-primary/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-2 right-2 left-2">
            <h3 className="font-bold text-white text-sm line-clamp-1">{title}</h3>
          </div>
          <Badge className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-primary/90">
            {type === "weekly" ? "هفتگی" : "ماهانه"}
          </Badge>
        </div>
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {toPersianNumber(participantCount)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {toPersianNumber(daysRemaining)} روز
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "overflow-hidden hover-elevate active-elevate-2 transition-all duration-300",
        className
      )}
      data-testid={`card-challenge-${id}`}
    >
      <div className="relative h-32 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center">
            <Zap className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
            {type === "weekly" ? translations.challenges.weekly : translations.challenges.monthly}
          </Badge>
        </div>

        <div className="absolute bottom-3 right-3 left-3">
          <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
          <div className="flex items-center gap-3 text-white/80 text-xs">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{toPersianNumber(participantCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {toPersianNumber(daysRemaining)} {translations.challenges.days}
                {daysRemaining < 1 && `, ${toPersianNumber(hoursRemaining)} ${translations.challenges.hours}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{goal}</span>
          {targetValue && (
            <Badge variant="outline" className="mr-auto text-xs">
              هدف: {toPersianNumber(targetValue)}
            </Badge>
          )}
        </div>

        {isJoined ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{translations.challenges.progress}</span>
              <span className="font-medium">{toPersianNumber(Math.round(progress))}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <Button variant="secondary" className="w-full gap-2" disabled>
              <Check className="h-4 w-4" />
              {translations.challenges.joined}
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
            onClick={onJoin}
            data-testid={`button-join-challenge-${id}`}
          >
            {translations.challenges.join}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function ChallengeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-muted skeleton-shimmer" />
      <CardContent className="p-4">
        <div className="h-4 w-3/4 bg-muted skeleton-shimmer rounded mb-3" />
        <div className="h-9 w-full bg-muted skeleton-shimmer rounded" />
      </CardContent>
    </Card>
  );
}
