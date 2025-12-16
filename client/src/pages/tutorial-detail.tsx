import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronRight, Heart, Eye, Play, CheckCircle2, 
  AlertTriangle, Lightbulb, Dumbbell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianNumber } from "@/lib/persian";
import { apiRequest } from "@/lib/queryClient";

const muscleLabels: Record<string, string> = {
  chest: "سینه",
  back: "پشت",
  shoulders: "شانه",
  biceps: "جلو بازو",
  triceps: "پشت بازو",
  legs: "پا",
  glutes: "باسن",
  abs: "شکم",
  cardio: "کاردیو",
  full_body: "کل بدن",
};

const difficultyLabels: Record<string, string> = {
  beginner: "مبتدی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
  expert: "حرفه‌ای",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600",
  intermediate: "bg-yellow-500/10 text-yellow-600",
  advanced: "bg-orange-500/10 text-orange-600",
  expert: "bg-red-500/10 text-red-600",
};

export default function TutorialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: tutorial, isLoading } = useQuery({
    queryKey: ["/api/tutorials", id],
    queryFn: async () => {
      const res = await fetch(`/api/tutorials/${id}`);
      return res.json();
    },
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/tutorials/${id}/like`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutorials", id] });
    },
  });

  if (isLoading) {
    return <TutorialDetailSkeleton />;
  }

  if (!tutorial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">آموزش یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setLocation("/learn")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <h1 className="font-bold truncate">{tutorial.name}</h1>
        </div>
      </div>

      {/* Video/Thumbnail */}
      <div className="aspect-video bg-muted relative">
        {tutorial.videoUrl ? (
          <video
            src={tutorial.videoUrl}
            controls
            className="w-full h-full object-cover"
            poster={tutorial.thumbnailUrl}
          />
        ) : tutorial.thumbnailUrl ? (
          <img
            src={tutorial.thumbnailUrl}
            alt={tutorial.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Title & Stats */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold">{tutorial.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              className={cn(likeMutation.isPending && "opacity-50")}
              onClick={() => likeMutation.mutate()}
            >
              <Heart className={cn("h-5 w-5", tutorial.isLiked && "fill-red-500 text-red-500")} />
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {toPersianNumber(tutorial.likeCount || 0)} پسند
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {toPersianNumber(tutorial.viewCount || 0)} بازدید
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={difficultyColors[tutorial.difficulty]}>
            {difficultyLabels[tutorial.difficulty]}
          </Badge>
          <Badge variant="secondary">
            {muscleLabels[tutorial.muscleGroup] || tutorial.muscleGroup}
          </Badge>
          {tutorial.secondaryMuscles?.map((muscle: string) => (
            <Badge key={muscle} variant="outline">
              {muscleLabels[muscle] || muscle}
            </Badge>
          ))}
        </div>

        {/* Coach */}
        <Card className="border-0 bg-card/80">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={tutorial.coach?.avatar} />
                <AvatarFallback>
                  {tutorial.coach?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{tutorial.coach?.fullName}</p>
                <p className="text-xs text-muted-foreground">مربی</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {tutorial.description && (
          <div>
            <h2 className="font-bold mb-2">توضیحات</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tutorial.description}
            </p>
          </div>
        )}

        {/* Instructions */}
        {tutorial.instructions?.length > 0 && (
          <div>
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              نحوه اجرا
            </h2>
            <div className="space-y-2">
              {tutorial.instructions.map((step: string, index: number) => (
                <div key={index} className="flex gap-3 text-sm">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {toPersianNumber(index + 1)}
                  </span>
                  <p className="text-muted-foreground pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {tutorial.tips?.length > 0 && (
          <div>
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              نکات کلیدی
            </h2>
            <div className="space-y-2">
              {tutorial.tips.map((tip: string, index: number) => (
                <div key={index} className="flex gap-2 text-sm">
                  <span className="text-yellow-500">•</span>
                  <p className="text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Mistakes */}
        {tutorial.commonMistakes?.length > 0 && (
          <div>
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              اشتباهات رایج
            </h2>
            <div className="space-y-2">
              {tutorial.commonMistakes.map((mistake: string, index: number) => (
                <div key={index} className="flex gap-2 text-sm">
                  <span className="text-red-500">✗</span>
                  <p className="text-muted-foreground">{mistake}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TutorialDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b" />
      <Skeleton className="aspect-video" />
      <div className="px-4 py-4 space-y-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
