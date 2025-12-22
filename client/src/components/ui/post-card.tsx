import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Flag } from "lucide-react";
import { formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/ui/report-dialog";


interface PostCardProps {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  content: string;
  images?: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string | Date;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: (isCurrentlyLiked: boolean) => void;
  onSave?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  className?: string;
}

export function PostCard({
  id,
  userId,
  userName,
  userAvatar,
  content,
  images = [],
  likeCount,
  commentCount,
  createdAt,
  isLiked = false,
  isSaved = false,
  onLike,
  onSave,
  onComment,
  onShare,
  className,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likes, setLikes] = useState(likeCount);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Sync state with props when they change
  useEffect(() => {
    setLiked(isLiked);
    setLikes(likeCount);
  }, [isLiked, likeCount]);

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleLike = () => {
    // Call API with current liked state
    onLike?.(liked);
    // Optimistic update
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    if (!liked) {
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 800);
    }
  };

  return (
    <Card
      className={cn("overflow-hidden border-0 bg-card/80 hover:bg-card transition-colors duration-300", className)}
      data-testid={`card-post-${id}`}
    >
      <CardHeader className="flex flex-row items-center gap-3 p-5 pb-3">
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setLocation(`/user/${userId}`)}
        >
          <Avatar className="h-11 w-11 ring-2 ring-primary/10">
            <AvatarImage src={userAvatar || undefined} alt={userName} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setLocation(`/user/${userId}`)}
        >
          <h4 className="font-bold text-sm truncate hover:text-primary transition-colors">{userName}</h4>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(createdAt)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-right">
            <DropdownMenuItem className="justify-end gap-2" onClick={() => setReportOpen(true)}>
              <Flag className="h-4 w-4" />
              گزارش
            </DropdownMenuItem>
            <DropdownMenuItem className="justify-end">کپی لینک</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ReportDialog open={reportOpen} onOpenChange={setReportOpen} itemId={id} itemType="post" />
      </CardHeader>

      <CardContent className="px-4 py-2">
        <p 
          className="text-sm leading-relaxed whitespace-pre-wrap cursor-pointer"
          onClick={() => setLocation(`/post/${id}`)}
        >
          {content}
        </p>

        {images.length > 0 && (
          <div 
            className={cn(
              "mt-3 rounded-lg overflow-hidden cursor-pointer",
              images.length === 1 ? "grid-cols-1" : "grid grid-cols-2 gap-1"
            )}
            onClick={() => setLocation(`/post/${id}`)}
          >
            {images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={cn(
                  "relative bg-muted",
                  images.length === 1 ? "aspect-video" : "aspect-square",
                  index === 0 && images.length === 3 && "col-span-2"
                )}
              >
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      +{toPersianNumber(images.length - 4)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 hover:bg-transparent"
          onClick={() => {
            setSaved(!saved);
            onSave?.();
          }}
          data-testid={`button-save-${id}`}
        >
          <Bookmark className={cn("h-[22px] w-[22px]", saved && "fill-current")} />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-11 px-3 hover:bg-transparent gap-1"
            onClick={onShare}
            data-testid={`button-share-${id}`}
          >
            <Share2 className="h-[20px] w-[20px]" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-11 px-3 hover:bg-transparent gap-1"
            onClick={() => setLocation(`/post/${id}`)}
            data-testid={`button-comment-${id}`}
          >
            <MessageCircle className="h-[20px] w-[20px]" />
            {commentCount > 0 && <span className="text-xs text-muted-foreground">{toPersianNumber(commentCount)}</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-11 px-3 hover:bg-transparent gap-1", liked && "text-red-500")}
            onClick={handleLike}
            data-testid={`button-like-${id}`}
          >
            <Heart className={cn("h-[20px] w-[20px]", liked && "fill-current")} />
            {likes > 0 && <span className="text-xs">{toPersianNumber(likes)}</span>}
          </Button>
        </div>
      </CardFooter>

    </Card>
  );
}

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
        <div className="h-10 w-10 rounded-full bg-muted skeleton-shimmer" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-muted skeleton-shimmer rounded mb-1" />
          <div className="h-3 w-16 bg-muted skeleton-shimmer rounded" />
        </div>
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted skeleton-shimmer rounded" />
          <div className="h-4 w-3/4 bg-muted skeleton-shimmer rounded" />
        </div>
        <div className="mt-3 aspect-video bg-muted skeleton-shimmer rounded-lg" />
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-muted skeleton-shimmer rounded" />
          <div className="h-8 w-16 bg-muted skeleton-shimmer rounded" />
          <div className="h-8 w-8 bg-muted skeleton-shimmer rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}
