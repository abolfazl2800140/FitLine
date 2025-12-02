import { Card, CardContent } from "@/components/ui/card";
import { toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1 truncate">{title}</p>
            <p className="text-2xl font-bold tracking-tight">
              {typeof value === "number" ? toPersianNumber(value) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs mt-1 flex items-center gap-1",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}>
                <span>{trend.isPositive ? "+" : "-"}{toPersianNumber(Math.abs(trend.value))}%</span>
                <span className="text-muted-foreground">از ماه گذشته</span>
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
