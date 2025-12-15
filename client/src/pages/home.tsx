import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoachCard, CoachCardSkeleton } from "@/components/ui/coach-card";
import { PostCard, PostCardSkeleton } from "@/components/ui/post-card";
import { ProgramCard, ProgramCardSkeleton } from "@/components/ui/program-card";
import { ChallengeCard, ChallengeCardSkeleton } from "@/components/ui/challenge-card";
import { toPersianNumber } from "@/lib/persian";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Dumbbell,
  Flame,
  Trophy,
  ChevronLeft,
  Users,
  Zap,
  Star,
  Apple,
  ShoppingBag,
  MessageCircle,
  Newspaper,
  GraduationCap,
  Settings,
  User,
} from "lucide-react";
import CoachHomePage from "@/pages/coach/home";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";


export default function HomePage() {
  const queryClient = useQueryClient();
  const { data: coaches, isLoading: coachesLoading } = useQuery<any[]>({
    queryKey: ["/api/coaches"],
  });

  const { data: posts, isLoading: postsLoading } = useQuery<any[]>({
    queryKey: ["/api/posts"],
  });

  const { data: programs, isLoading: programsLoading } = useQuery<any[]>({
    queryKey: ["/api/programs"],
  });

  const { data: challenges, isLoading: challengesLoading } = useQuery<any[]>({
    queryKey: ["/api/challenges"],
  });

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: dashboardStats } = useQuery<{
    points: number;
    calories: number;
    rank: number | null;
    progress: number;
    streak: number;
  }>({
    queryKey: ["/api/user/dashboard-stats"],
    enabled: !!user,
  });

  // If user is a coach, show coach dashboard
  if (user?.role === "coach") {
    return <CoachHomePage />;
  }

  // Refresh function for pull-to-refresh
  const handleRefresh = async () => {
    // Run refresh and minimum delay in parallel
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/coaches"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/user/dashboard-stats"] }),
      // Minimum 1 second delay so user feels the refresh
      new Promise(resolve => setTimeout(resolve, 1000)),
    ]);
  };

  // App-style dashboard for logged-in users (athletes)
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
          <div className="flex items-center justify-between px-5 h-14 relative">
            {dashboardStats && dashboardStats.streak > 0 ? (
              <Badge variant="secondary" className="gap-1 px-3 py-1.5 bg-white/20 text-primary-foreground border-0">
                <Flame className="h-4 w-4 text-orange-300" />
                <span className="font-bold">{toPersianNumber(dashboardStats.streak)} روز</span>
              </Badge>
            ) : (
              <div className="w-16" />
            )}
            <span className="text-lg italic font-semibold text-primary-foreground">FitLine</span>
            <div className="w-16" />
          </div>
        </div>
        {/* Spacer for fixed header */}
        <div className="h-14" />
        
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="pb-4">

        {/* Stats & Programs Combined Section */}
        <section className="px-4 pt-3 pb-4">
          {/* Stats Row */}
          <div className="flex gap-3 mb-4">
            {/* Points */}
            <div className="flex-1 flex items-center gap-3 bg-primary/10 rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-xl font-black text-primary">{toPersianNumber(dashboardStats?.points || user?.points || 0)}</p>
                <p className="text-[11px] text-muted-foreground">امتیاز</p>
              </div>
            </div>
            {/* Rank */}
            <div className="flex-1 flex items-center gap-3 bg-yellow-500/10 rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xl font-black text-yellow-500">{dashboardStats?.rank ? toPersianNumber(dashboardStats.rank) : '-'}</p>
                <p className="text-[11px] text-muted-foreground">رتبه</p>
              </div>
            </div>
          </div>

        </section>

        {/* Quick Access Grid */}
        <section className="px-4 py-4">
          <h3 className="text-sm font-bold text-muted-foreground mb-3">دسترسی سریع</h3>
          <div className="grid grid-cols-4 gap-3">
            <Link href="/coaches">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 active:scale-95 transition-all">
                <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-[11px] font-medium">مربیان</span>
              </div>
            </Link>
            <Link href="/my-programs">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 active:scale-95 transition-all">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[11px] font-medium">برنامه‌هام</span>
              </div>
            </Link>
            <Link href="/store">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 active:scale-95 transition-all">
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-purple-500" />
                </div>
                <span className="text-[11px] font-medium">فروشگاه</span>
              </div>
            </Link>
            <Link href="/messages">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 active:scale-95 transition-all">
                <div className="w-11 h-11 rounded-xl bg-pink-500/15 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-pink-500" />
                </div>
                <span className="text-[11px] font-medium">پیام‌ها</span>
              </div>
            </Link>
            <Link href="/challenges">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 active:scale-95 transition-all">
                <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-500" />
                </div>
                <span className="text-[11px] font-medium">چالش‌ها</span>
              </div>
            </Link>
            <Link href="/leagues">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 active:scale-95 transition-all">
                <div className="w-11 h-11 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <span className="text-[11px] font-medium">لیگ‌ها</span>
              </div>
            </Link>
            <Link href="/education">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 active:scale-95 transition-all">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-cyan-500" />
                </div>
                <span className="text-[11px] font-medium">انجمن</span>
              </div>
            </Link>
            <Link href="/feed">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 active:scale-95 transition-all">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Newspaper className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-[11px] font-medium">فید</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Secondary Quick Access */}
        <section className="px-4 pb-4">
          <div className="flex gap-2">
            <Link href="/my-requests" className="flex-1">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 active:scale-[0.98] transition-all">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">درخواست‌هام</span>
              </div>
            </Link>
            <Link href="/settings" className="flex-1">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 active:scale-[0.98] transition-all">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">تنظیمات</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Coaches Section */}
        <section className="py-4">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="font-bold text-lg">مربیان برتر</h2>
            <Link href="/coaches">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                همه
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto px-5 no-scrollbar pb-2">
            {coachesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[160px]">
                  <CoachCardSkeleton />
                </div>
              ))
            ) : coaches && coaches.length > 0 ? (
              coaches.slice(0, 6).map((coach: any) => (
                <div key={coach.id} className="min-w-[160px]">
                  <CoachCard
                    id={coach.id}
                    name={coach.user?.fullName || "مربی"}
                    avatar={coach.user?.avatar}
                    specialty={coach.specialty}
                    experience={coach.experience}
                    pricePerSession={coach.pricePerSession}
                    rating={coach.rating}
                    reviewCount={coach.reviewCount || 0}
                    clientCount={coach.clientCount || 0}
                    isVerified={coach.isVerified}
                    compact
                  />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">مربیان به زودی اضافه می‌شوند</p>
            )}
          </div>
        </section>

        {/* Active Challenges */}
        <section className="py-4">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              چالش‌های فعال
            </h2>
            <Link href="/challenges">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                همه
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto px-5 no-scrollbar pb-2">
            {challengesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="min-w-[280px]">
                  <ChallengeCardSkeleton />
                </div>
              ))
            ) : challenges && challenges.length > 0 ? (
              challenges.slice(0, 4).map((challenge: any) => (
                <div key={challenge.id} className="min-w-[280px]">
                  <ChallengeCard
                    id={challenge.id}
                    title={challenge.title}
                    description={challenge.description}
                    type={challenge.type || "weekly"}
                    goal={challenge.goal}
                    targetValue={challenge.targetValue}
                    participantCount={challenge.participantCount || 0}
                    startDate={challenge.startDate}
                    endDate={challenge.endDate}
                    coverImage={challenge.coverImage}
                    compact
                  />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">چالش‌ها به زودی اضافه می‌شوند</p>
            )}
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">پست‌های اخیر</h2>
            <Link href="/feed">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                همه
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {postsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            ) : posts && posts.length > 0 ? (
              posts.slice(0, 2).map((post: any) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  userId={post.userId}
                  userName={post.user?.fullName || "کاربر"}
                  userAvatar={post.user?.avatar}
                  content={post.content}
                  images={post.images || []}
                  likeCount={post.likeCount || 0}
                  commentCount={post.commentCount || 0}
                  createdAt={post.createdAt}
                />
              ))
            ) : (
              <Card className="text-center py-8 border-0 bg-card/80">
                <CardContent>
                  <Target className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">پست‌ها به زودی اضافه می‌شوند</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Bottom spacing for nav */}
        <div className="h-8" />
          </div>
        </PullToRefresh>
      </div>
    );
  }

  // Landing page for guests
  return (
    <div className="min-h-screen bg-background">
      {/* Coaches Section */}
      <section className="py-6">
        <div className="flex items-center justify-between px-5 mb-4">
          <h2 className="font-bold text-lg">مربیان برتر</h2>
          <Link href="/coaches">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              همه
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 no-scrollbar pb-2">
          {coachesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[160px]">
                <CoachCardSkeleton />
              </div>
            ))
          ) : coaches && coaches.length > 0 ? (
            coaches.slice(0, 6).map((coach: any) => (
              <div key={coach.id} className="min-w-[160px]">
                <CoachCard
                  id={coach.id}
                  name={coach.user?.fullName || "مربی"}
                  avatar={coach.user?.avatar}
                  specialty={coach.specialty}
                  experience={coach.experience}
                  pricePerSession={coach.pricePerSession}
                  rating={coach.rating}
                  reviewCount={coach.reviewCount || 0}
                  clientCount={coach.clientCount || 0}
                  isVerified={coach.isVerified}
                  compact
                />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">مربیان به زودی اضافه می‌شوند</p>
          )}
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-6 bg-muted/30">
        <div className="flex items-center justify-between px-5 mb-4">
          <h2 className="font-bold text-lg">برنامه‌های تمرینی</h2>
          <Link href="/programs">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              همه
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 no-scrollbar pb-2">
          {programsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[260px]">
                <ProgramCardSkeleton />
              </div>
            ))
          ) : programs && programs.length > 0 ? (
            programs.slice(0, 4).map((program: any) => (
              <div key={program.id} className="min-w-[260px]">
                <ProgramCard
                  id={program.id}
                  title={program.title}
                  coachName={program.coach?.fullName || "مربی"}
                  coachAvatar={program.coach?.avatar}
                  coverImage={program.coverImage}
                  difficulty={program.difficulty || "beginner"}
                  durationWeeks={program.durationWeeks}
                  price={program.price}
                />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">برنامه‌ها به زودی اضافه می‌شوند</p>
          )}
        </div>
      </section>

      {/* CTA Section - Compact */}
      <section className="py-8 px-5">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-white">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">آماده شروع هستید؟</h2>
            <p className="text-white/80 text-sm mb-4">همین الان به Elite Fitness Hub بپیوندید</p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="font-bold">
                ثبت‌نام رایگان
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
