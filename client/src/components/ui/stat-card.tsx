import { Card, CardContent } from "@/components/ui/card";
import { toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(
      "border-0 bg-card/80 backdrop-blur-sm overflow-hidden group interactive-card",
      className
    )}>
      <CardContent className="p-5 relative">
        {/* Background glow */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
        
        <div className="flex items-start justify-between gap-3 relative">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{title}</p>
            <p className="stat-number text-3xl font-black tracking-tight text-foreground">
              {typeof value === "number" ? toPersianNumber(value) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1.5 mt-2 text-xs font-bold",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span>{trend.isPositive ? "+" : ""}{toPersianNumber(trend.value)}%</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
