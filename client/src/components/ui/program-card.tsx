import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Dumbbell, User } from "lucide-react";
import { translations, formatPrice, toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface ProgramCardProps {
  id: string;
  title: string;
  coachName: string;
  coachAvatar?: string | null;
  coverImage?: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  durationWeeks: number;
  price?: string | number | null;
  progress?: number;
  isEnrolled?: boolean;
  className?: string;
}

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  expert: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function ProgramCard({
  id,
  title,
  coachName,
  coachAvatar,
  coverImage,
  difficulty,
  durationWeeks,
  price,
  progress,
  isEnrolled = false,
  className,
}: ProgramCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden hover-elevate active-elevate-2 transition-all duration-300 group cursor-pointer",
        className
      )}
      data-testid={`card-program-${id}`}
    >
      <Link href={`/programs/${id}`}>
        <div className="relative aspect-video overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Dumbbell className="h-12 w-12 text-primary/40" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute top-3 right-3">
            <Badge 
              variant="outline" 
              className={cn("border", difficultyColors[difficulty])}
            >
              {translations.programs.difficulty[difficulty]}
            </Badge>
          </div>

          <div className="absolute bottom-3 right-3 left-3">
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Clock className="h-4 w-4" />
              <span>{toPersianNumber(durationWeeks)} {translations.programs.weeks}</span>
            </div>
          </div>

          {isEnrolled && typeof progress === "number" && (
            <div className="absolute top-3 left-3">
              <div className="relative w-10 h-10">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeDasharray={`${progress}, 100`}
                    className="progress-ring-circle"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {toPersianNumber(Math.round(progress))}%
                </span>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{coachName}</span>
          </div>

          {isEnrolled ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{translations.programs.progress}</span>
                <span className="font-medium">{toPersianNumber(Math.round(progress || 0))}%</span>
              </div>
              <Progress value={progress || 0} className="h-1.5" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">
                {price ? `${formatPrice(price)} ${translations.coaches.toman}` : "رایگان"}
              </span>
              <Badge variant="secondary">
                {translations.programs.enroll}
              </Badge>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}

export function ProgramCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted skeleton-shimmer" />
      <CardContent className="p-4">
        <div className="h-5 w-3/4 bg-muted skeleton-shimmer rounded mb-2" />
        <div className="h-4 w-1/2 bg-muted skeleton-shimmer rounded mb-3" />
        <div className="h-4 w-full bg-muted skeleton-shimmer rounded" />
      </CardContent>
    </Card>
  );
}
