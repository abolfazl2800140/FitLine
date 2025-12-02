import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { Leaderboard } from "@/components/ui/leaderboard";
import { translations, toPersianNumber } from "@/lib/persian";
import { Trophy, Medal, Crown, Timer, TrendingUp, Users, Zap } from "lucide-react";

const tiers = [
  { value: "bronze", label: translations.leagues.tiers.bronze, color: "text-amber-600" },
  { value: "silver", label: translations.leagues.tiers.silver, color: "text-gray-400" },
  { value: "gold", label: translations.leagues.tiers.gold, color: "text-yellow-500" },
  { value: "platinum", label: translations.leagues.tiers.platinum, color: "text-cyan-400" },
  { value: "diamond", label: translations.leagues.tiers.diamond, color: "text-violet-400" },
];

export default function LeaguesPage() {
  const [selectedTier, setSelectedTier] = useState("gold");

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: leagueData, isLoading } = useQuery<any>({
    queryKey: ["/api/leagues/current", selectedTier],
  });

  const { data: userLeagueStats } = useQuery<any>({
    queryKey: ["/api/leagues/my-stats"],
    enabled: !!currentUser,
  });

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.max(0, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const mockLeaderboard = [
    { id: "1", rank: 1, name: "علی احمدی", score: 2850, avatar: null },
    { id: "2", rank: 2, name: "سارا محمدی", score: 2720, avatar: null },
    { id: "3", rank: 3, name: "رضا کریمی", score: 2650, avatar: null },
    { id: "4", rank: 4, name: "مریم حسینی", score: 2480, avatar: null },
    { id: "5", rank: 5, name: "امیر رضایی", score: 2350, avatar: null },
    { id: "6", rank: 6, name: "نازنین علوی", score: 2200, avatar: null },
    { id: "7", rank: 7, name: "محمد جعفری", score: 2100, avatar: null, isCurrentUser: true },
    { id: "8", rank: 8, name: "فاطمه نوری", score: 1950, avatar: null },
    { id: "9", rank: 9, name: "حسین صادقی", score: 1800, avatar: null },
    { id: "10", rank: 10, name: "زهرا میرزایی", score: 1720, avatar: null },
  ];

  const leaderboardData = leagueData?.members || mockLeaderboard;

  return (
    <div className="container px-4 md:px-6 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{translations.leagues.title}</h1>
        <p className="text-muted-foreground">
          در لیگ‌های ماهانه رقابت کنید و جایزه ببرید
        </p>
      </div>

      {currentUser && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={translations.leagues.currentRank}
            value={userLeagueStats?.rank || 7}
            subtitle={`از ${toPersianNumber(100)} نفر`}
            icon={Medal}
          />
          <StatCard
            title={translations.leagues.totalScore}
            value={userLeagueStats?.score || "۲,۱۰۰"}
            icon={Trophy}
          />
          <StatCard
            title={translations.leagues.daysRemaining}
            value={daysRemaining}
            subtitle="روز"
            icon={Timer}
          />
          <StatCard
            title="امتیاز این هفته"
            value="+۳۵۰"
            icon={TrendingUp}
            trend={{ value: 15, isPositive: true }}
          />
        </div>
      )}

      <Card className="overflow-hidden mb-8">
        <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-primary" />
                لیگ {new Date().toLocaleDateString("fa-IR", { month: "long", year: "numeric" })}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {toPersianNumber(daysRemaining)} روز تا پایان لیگ
              </p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {tiers.map((tier) => (
                <Badge
                  key={tier.value}
                  variant={selectedTier === tier.value ? "default" : "outline"}
                  className={`cursor-pointer whitespace-nowrap ${
                    selectedTier !== tier.value ? tier.color : ""
                  }`}
                  onClick={() => setSelectedTier(tier.value)}
                  data-testid={`badge-tier-${tier.value}`}
                >
                  {tier.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-4 py-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-muted skeleton-shimmer" />
                    <div className="h-4 w-16 bg-muted skeleton-shimmer rounded mt-2" />
                  </div>
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="h-4 w-8 bg-muted skeleton-shimmer rounded" />
                  <div className="h-10 w-10 rounded-full bg-muted skeleton-shimmer" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-muted skeleton-shimmer rounded" />
                  </div>
                  <div className="h-4 w-12 bg-muted skeleton-shimmer rounded" />
                </div>
              ))}
            </div>
          ) : (
            <Leaderboard users={leaderboardData} />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">فعالیت اجتماعی</h3>
            <p className="text-sm text-muted-foreground mb-3">
              با پست گذاشتن و تعامل با دیگران امتیاز بگیرید
            </p>
            <Badge variant="secondary">۱۵٪ امتیاز</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">تمرین منظم</h3>
            <p className="text-sm text-muted-foreground mb-3">
              برنامه تمرینی خود را کامل کنید و امتیاز بگیرید
            </p>
            <Badge variant="secondary">۵۰٪ امتیاز</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">امتیاز مربی</h3>
            <p className="text-sm text-muted-foreground mb-3">
              نظرات مثبت از مربی شما امتیاز می‌آورد
            </p>
            <Badge variant="secondary">۳۵٪ امتیاز</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
