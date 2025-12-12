import { useQuery } from "@tanstack/react-query";
import { toPersianNumber } from "@/lib/persian";
import { Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointsDisplayProps {
    className?: string;
    showIcon?: boolean;
    size?: "sm" | "md" | "lg";
}

export function PointsDisplay({ className, showIcon = true, size = "md" }: PointsDisplayProps) {
    const { data } = useQuery<{ points: number }>({
        queryKey: ["/api/user/points"],
    });

    const sizeClasses = {
        sm: "text-xs gap-1",
        md: "text-sm gap-1.5",
        lg: "text-base gap-2",
    };

    const iconSizes = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    return (
        <div className={cn("flex items-center text-primary font-bold", sizeClasses[size], className)}>
            {showIcon && <Star className={cn(iconSizes[size], "fill-primary")} />}
            <span>{toPersianNumber(data?.points ?? 0)}</span>
        </div>
    );
}

interface LeaderboardProps {
    limit?: number;
    className?: string;
}

export function Leaderboard({ limit = 10, className }: LeaderboardProps) {
    const { data: leaderboard, isLoading } = useQuery<Array<{
        id: string;
        fullName: string;
        avatar: string | null;
        points: number;
        role: string;
    }>>({
        queryKey: ["/api/leaderboard", limit],
        queryFn: async () => {
            const res = await fetch(`/api/leaderboard?limit=${limit}`);
            return res.json();
        },
    });


    if (isLoading) {
        return (
            <div className={cn("space-y-3", className)}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-muted" />
                        <div className="flex-1 h-4 bg-muted rounded" />
                        <div className="w-12 h-4 bg-muted rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            {leaderboard?.map((user, index) => (
                <div
                    key={user.id}
                    className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-colors",
                        index === 0 && "bg-yellow-500/10 border border-yellow-500/20",
                        index === 1 && "bg-gray-400/10 border border-gray-400/20",
                        index === 2 && "bg-orange-500/10 border border-orange-500/20",
                        index > 2 && "bg-muted/30"
                    )}
                >
                    {/* Rank */}
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        index === 0 && "bg-yellow-500 text-white",
                        index === 1 && "bg-gray-400 text-white",
                        index === 2 && "bg-orange-500 text-white",
                        index > 2 && "bg-muted text-muted-foreground"
                    )}>
                        {toPersianNumber(index + 1)}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-primary font-bold">{user.fullName.charAt(0)}</span>
                        )}
                    </div>

                    {/* Name & Role */}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                            {user.role === "coach" ? "مربی" : "ورزشکار"}
                        </p>
                    </div>

                    {/* Points */}
                    <div className="flex items-center gap-1 text-primary font-bold">
                        <Star className="h-4 w-4 fill-primary" />
                        <span>{toPersianNumber(user.points)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
