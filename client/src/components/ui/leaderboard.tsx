import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { Crown, Medal } from "lucide-react";

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar?: string | null;
  score: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  users: LeaderboardUser[];
  className?: string;
}

const rankColors = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-amber-600",
};

const rankBgColors = {
  1: "bg-yellow-500/10 border-yellow-500/20",
  2: "bg-gray-400/10 border-gray-400/20",
  3: "bg-amber-600/10 border-amber-600/20",
};

export function Leaderboard({ users, className }: LeaderboardProps) {
  const topThree = users.filter(u => u.rank <= 3).sort((a, b) => a.rank - b.rank);
  const restUsers = users.filter(u => u.rank > 3);

  return (
    <div className={cn("space-y-6", className)}>
      {topThree.length > 0 && (
        <div className="flex items-end justify-center gap-4 py-6">
          {topThree.map((user) => (
            <div 
              key={user.id}
              className={cn(
                "flex flex-col items-center transition-all",
                user.rank === 1 && "order-2 scale-110",
                user.rank === 2 && "order-1",
                user.rank === 3 && "order-3"
              )}
              data-testid={`leaderboard-rank-${user.rank}`}
            >
              <div className={cn(
                "relative mb-2",
                user.rank === 1 && "mb-4"
              )}>
                {user.rank === 1 && (
                  <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-6 text-yellow-500 fill-yellow-500" />
                )}
                <Avatar className={cn(
                  "border-2",
                  user.rank === 1 && "h-20 w-20 border-yellow-500",
                  user.rank === 2 && "h-16 w-16 border-gray-400",
                  user.rank === 3 && "h-16 w-16 border-amber-600"
                )}>
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className={cn(
                    "text-lg font-bold",
                    rankBgColors[user.rank as keyof typeof rankBgColors]
                  )}>
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold border-2",
                  rankBgColors[user.rank as keyof typeof rankBgColors],
                  rankColors[user.rank as keyof typeof rankColors]
                )}>
                  {toPersianNumber(user.rank)}
                </div>
              </div>
              <p className={cn(
                "font-semibold text-sm mt-3 text-center",
                user.isCurrentUser && "text-primary"
              )}>
                {user.name}
              </p>
              <p className="text-lg font-bold text-primary">
                {toPersianNumber(user.score)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {restUsers.map((user) => (
          <div 
            key={user.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors",
              user.isCurrentUser 
                ? "bg-primary/10 border border-primary/20" 
                : "hover:bg-muted/50"
            )}
            data-testid={`leaderboard-row-${user.id}`}
          >
            <span className={cn(
              "w-8 text-center font-bold",
              user.isCurrentUser ? "text-primary" : "text-muted-foreground"
            )}>
              {toPersianNumber(user.rank)}
            </span>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className={cn(
              "flex-1 font-medium truncate",
              user.isCurrentUser && "text-primary"
            )}>
              {user.name}
              {user.isCurrentUser && (
                <Badge variant="secondary" className="mr-2 text-xs">
                  شما
                </Badge>
              )}
            </span>
            <span className="font-bold text-primary">
              {toPersianNumber(user.score)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
