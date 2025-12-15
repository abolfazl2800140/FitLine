import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from "lucide-react";
import { formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


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
  onLike?: () => void;
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
  onComment,
  onShare,
  className,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likes, setLikes] = useState(likeCount);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [, setLocation] = useLocation();

  const handleLike = () => {
    // Optimistic update
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    if (!liked) {
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 800);
    }
    // Call API
    onLike?.();
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
          <DropdownMenuContent align="start">
            <DropdownMenuItem>گزارش</DropdownMenuItem>
            <DropdownMenuItem>کپی لینک</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="px-4 py-2">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>

        {images.length > 0 && (
          <div className={cn(
            "mt-3 rounded-lg overflow-hidden",
            images.length === 1 ? "grid-cols-1" : "grid grid-cols-2 gap-1"
          )}>
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
          className="h-9 w-9 hover:bg-transparent"
          onClick={() => setSaved(!saved)}
          data-testid={`button-save-${id}`}
        >
          <Bookmark className={cn("h-[22px] w-[22px]", saved && "fill-current")} />
        </Button>

        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-transparent"
            onClick={onShare}
            data-testid={`button-share-${id}`}
          >
            <Share2 className="h-[22px] w-[22px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-transparent"
            onClick={() => setLocation(`/post/${id}`)}
            data-testid={`button-comment-${id}`}
          >
            <MessageCircle className="h-[22px] w-[22px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9 hover:bg-transparent", liked && "text-red-500")}
            onClick={handleLike}
            data-testid={`button-like-${id}`}
          >
            <Heart className={cn("h-[22px] w-[22px]", liked && "fill-current")} />
          </Button>
        </div>
      </CardFooter>

      {/* Stats row */}
      <div className="px-4 pb-3 flex items-center justify-end gap-4 text-sm text-muted-foreground">
        <span>{toPersianNumber(likes)} پسند</span>
        <span>{toPersianNumber(commentCount)} پاسخ</span>
      </div>

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
