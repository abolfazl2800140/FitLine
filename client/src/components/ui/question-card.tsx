import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronUp, ChevronDown, MessageSquare } from "lucide-react";
import { translations, formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface QuestionCardProps {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  voteCount: number;
  answerCount: number;
  createdAt: string | Date;
  userVote?: 1 | -1 | 0;
  onVote?: (value: 1 | -1) => void;
  className?: string;
}

const categoryColors: Record<string, string> = {
  nutrition: "bg-green-500/10 text-green-500 border-green-500/20",
  training: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  supplements: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  injury: "bg-red-500/10 text-red-500 border-red-500/20",
  general: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export function QuestionCard({
  id,
  title,
  content,
  category,
  userId,
  userName,
  userAvatar,
  voteCount,
  answerCount,
  createdAt,
  userVote = 0,
  onVote,
  className,
}: QuestionCardProps) {
  const [localVote, setLocalVote] = useState<1 | -1 | 0>(userVote);
  const [localVoteCount, setLocalVoteCount] = useState(voteCount);

  const handleVote = (value: 1 | -1) => {
    // Toggle vote: if same vote clicked, remove it
    const newVote = localVote === value ? 0 : value;

    // Calculate vote count change
    let countChange = 0;
    if (localVote === 0) {
      countChange = value;
    } else if (newVote === 0) {
      countChange = -localVote;
    } else {
      countChange = value * 2; // Switching from -1 to 1 or vice versa
    }

    setLocalVote(newVote as 1 | -1 | 0);
    setLocalVoteCount(prev => prev + countChange);
    onVote?.(value);
  };

  return (
    <Card
      className={cn("overflow-hidden hover-elevate transition-all", className)}
      data-testid={`card-question-${id}`}
    >
      <div className="flex">
        <div className="flex flex-col items-center gap-1 p-4 bg-muted/30">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 transition-colors hover:bg-transparent hover:text-inherit",
              localVote === 1 && "text-primary bg-primary/10"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleVote(1);
            }}
            data-testid={`button-upvote-${id}`}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
          <span className={cn(
            "font-bold text-lg",
            localVoteCount > 0 && "text-primary",
            localVoteCount < 0 && "text-destructive"
          )}>
            {toPersianNumber(localVoteCount)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 transition-colors hover:bg-transparent hover:text-inherit",
              localVote === -1 && "text-destructive bg-destructive/10"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleVote(-1);
            }}
            data-testid={`button-downvote-${id}`}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 min-w-0">
          <Link href={`/education/${id}`}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2 mb-2">
                {category && (
                  <Badge
                    variant="outline"
                    className={cn("text-xs", categoryColors[category] || categoryColors.general)}
                  >
                    {translations.education.categories[category as keyof typeof translations.education.categories] || category}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{toPersianNumber(answerCount)} {translations.education.answers}</span>
                </div>
              </div>
              <h3 className="font-semibold text-base hover:text-primary transition-colors line-clamp-2">
                {title}
              </h3>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {content}
              </p>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={userAvatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{userName}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(createdAt)}
                </span>
              </div>
            </CardContent>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function QuestionCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="flex flex-col items-center gap-1 p-4 bg-muted/30 w-16">
          <div className="h-8 w-8 bg-muted skeleton-shimmer rounded" />
          <div className="h-6 w-6 bg-muted skeleton-shimmer rounded" />
          <div className="h-8 w-8 bg-muted skeleton-shimmer rounded" />
        </div>
        <div className="flex-1 p-4">
          <div className="h-4 w-20 bg-muted skeleton-shimmer rounded mb-2" />
          <div className="h-5 w-3/4 bg-muted skeleton-shimmer rounded mb-2" />
          <div className="h-4 w-full bg-muted skeleton-shimmer rounded mb-1" />
          <div className="h-4 w-2/3 bg-muted skeleton-shimmer rounded mb-3" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted skeleton-shimmer rounded-full" />
            <div className="h-3 w-20 bg-muted skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    </Card>
  );
}
