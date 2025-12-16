import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Users,
  TrendingUp,
  Wallet,
  ChevronRight,
  Star,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { toPersianNumber, formatPrice } from "@/lib/persian";

export default function CoachDashboardPage() {
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: stats } = useQuery<{
    activeStudents: number;
    pendingRequests: number;
    monthlyIncome: number;
    completionRate: number;
    rating: string;
    reviewCount: number;
    newStudentsThisMonth: number;
    programsCreatedThisMonth: number;
    messagesReceivedThisMonth: number;
  }>({
    queryKey: ["/api/coach/stats"],
    enabled: !!user && user.role === "coach",
  });

  const coachStats = {
    activeStudents: stats?.activeStudents || 0,
    pendingRequests: stats?.pendingRequests || 0,
    monthlyIncome: stats?.monthlyIncome || 0,
    completionRate: stats?.completionRate || 0,
    rating: stats?.rating || "0",
    reviewCount: stats?.reviewCount || 0,
    newStudentsThisMonth: stats?.newStudentsThisMonth || 0,
    programsCreatedThisMonth: stats?.programsCreatedThisMonth || 0,
    messagesReceivedThisMonth: stats?.messagesReceivedThisMonth || 0,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">داشبورد مربی</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Rating Card */}
        <Card className="border-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">امتیاز شما</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  <span className="text-3xl font-black">{toPersianNumber(parseFloat(coachStats.rating).toFixed(1))}</span>
                  <span className="text-sm text-muted-foreground">از ۵</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {toPersianNumber(coachStats.reviewCount)} نظر
                </p>
              </div>
              <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <Users className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{toPersianNumber(coachStats.activeStudents)}</p>
              <p className="text-xs text-muted-foreground">شاگرد فعال</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4">
              <Wallet className="h-5 w-5 text-green-500 mb-2" />
              <p className="text-lg font-bold">{formatPrice(coachStats.monthlyIncome)}</p>
              <p className="text-xs text-muted-foreground">درآمد این ماه</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4">
              <TrendingUp className="h-5 w-5 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{toPersianNumber(coachStats.completionRate)}%</p>
              <p className="text-xs text-muted-foreground">نرخ تکمیل برنامه</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-4">
              <BarChart3 className="h-5 w-5 text-purple-500 mb-2" />
              <p className="text-2xl font-bold">{toPersianNumber(coachStats.pendingRequests)}</p>
              <p className="text-xs text-muted-foreground">درخواست در انتظار</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Summary */}
        <Card className="border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">خلاصه این ماه</h3>
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                {new Date().toLocaleDateString('fa-IR', { month: 'long', year: 'numeric' })}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">شاگرد جدید</span>
                <div className="flex items-center gap-1 text-green-500">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="font-bold">{toPersianNumber(coachStats.newStudentsThisMonth)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">برنامه نوشته شده</span>
                <span className="font-bold">{toPersianNumber(coachStats.programsCreatedThisMonth)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">پیام دریافتی</span>
                <span className="font-bold">{toPersianNumber(coachStats.messagesReceivedThisMonth)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
