import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronRight, Heart, Eye, Clock, BookOpen, Share2, Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianNumber, formatRelativeTime } from "@/lib/persian";
import { apiRequest } from "@/lib/queryClient";

const categoryLabels: Record<string, string> = {
  nutrition: "تغذیه",
  training: "تمرین",
  recovery: "ریکاوری",
  motivation: "انگیزشی",
  supplements: "مکمل",
  lifestyle: "سبک زندگی",
};

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery({
    queryKey: ["/api/articles", id],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${id}`);
      return res.json();
    },
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/articles/${id}/like`);
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/articles", id] });

      // Snapshot the previous value
      const previousArticle = queryClient.getQueryData(["/api/articles", id]);

      // Optimistically update
      queryClient.setQueryData(["/api/articles", id], (old: any) => ({
        ...old,
        isLiked: !old?.isLiked,
        likeCount: old?.isLiked ? (old?.likeCount || 1) - 1 : (old?.likeCount || 0) + 1,
      }));

      return { previousArticle };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousArticle) {
        queryClient.setQueryData(["/api/articles", id], context.previousArticle);
      }
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/articles/${id}/bookmark`);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["/api/articles", id] });
      const previousArticle = queryClient.getQueryData(["/api/articles", id]);
      queryClient.setQueryData(["/api/articles", id], (old: any) => ({
        ...old,
        isBookmarked: !old?.isBookmarked,
      }));
      return { previousArticle };
    },
    onError: (err, variables, context) => {
      if (context?.previousArticle) {
        queryClient.setQueryData(["/api/articles", id], context.previousArticle);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    }
  };

  if (isLoading) {
    return <ArticleDetailSkeleton />;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">مقاله یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setLocation("/learn")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <span className="font-bold">مقاله</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(bookmarkMutation.isPending && "opacity-50")}
              onClick={() => bookmarkMutation.mutate()}
            >
              <Bookmark className={cn("h-5 w-5", article.isBookmarked && "fill-primary text-primary")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="aspect-video bg-muted">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* Category & Reading Time */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {categoryLabels[article.category] || article.category}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {toPersianNumber(article.readingTime || 5)} دقیقه مطالعه
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold leading-relaxed">{article.title}</h1>

        {/* Author & Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={article.author?.avatar} />
              <AvatarFallback>
                {article.author?.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{article.author?.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(article.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <button 
              className={cn("flex items-center gap-1 transition-colors", article.isLiked && "text-red-500")}
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
            >
              <Heart className={cn("h-4 w-4", article.isLiked && "fill-current")} />
              {toPersianNumber(article.likeCount || 0)}
            </button>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {toPersianNumber(article.viewCount || 0)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Content */}
        <article className="prose prose-sm dark:prose-invert max-w-none">
          <div 
            className="text-sm leading-7 text-foreground/90 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
          />
        </article>
      </div>
    </div>
  );
}

// Simple content formatter
function formatContent(content: string): string {
  if (!content) return "";
  
  // Convert line breaks to paragraphs
  return content
    .split("\n\n")
    .map(p => `<p class="mb-4">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function ArticleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b" />
      <Skeleton className="aspect-video" />
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}
