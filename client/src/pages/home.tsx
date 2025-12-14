import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoachCard, CoachCardSkeleton } from "@/components/ui/coach-card";
import { PostCard, PostCardSkeleton } from "@/components/ui/post-card";
import { ProgramCard, ProgramCardSkeleton } from "@/components/ui/program-card";
import { ChallengeCard, ChallengeCardSkeleton } from "@/components/ui/challenge-card";
import { toPersianNumber } from "@/lib/persian";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Dumbbell,
  Flame,
  Trophy,
  TrendingUp,
  ChevronLeft,
  Target,
  Users,
  Zap,
  Star,
  Apple,
} from "lucide-react";
import CoachHomePage from "@/pages/coach/home";


export default function HomePage() {
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

        {/* Quick Stats */}
        <section className="px-5 py-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
              <Star className="h-5 w-5 mx-auto mb-1 text-primary fill-primary" />
              <p className="text-lg font-bold">{toPersianNumber(dashboardStats?.points || user?.points || 0)}</p>
              <p className="text-[10px] text-muted-foreground">امتیاز</p>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
              <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
              <p className="text-lg font-bold">{toPersianNumber(dashboardStats?.calories || 0)}</p>
              <p className="text-[10px] text-muted-foreground">کالری</p>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
              <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-lg font-bold">{dashboardStats?.rank ? `#${toPersianNumber(dashboardStats.rank)}` : '-'}</p>
              <p className="text-[10px] text-muted-foreground">رتبه</p>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-lg font-bold">{toPersianNumber(dashboardStats?.progress || 0)}%</p>
              <p className="text-[10px] text-muted-foreground">پیشرفت</p>
            </div>
          </div>
        </section>

        {/* My Programs Card */}
        <section className="px-5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/my-programs">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-white cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-4">
                  <Dumbbell className="h-8 w-8 mb-2 opacity-80" />
                  <h3 className="font-bold mb-1">برنامه تمرینی</h3>
                  <p className="text-xs text-white/70">مشاهده تمرینات</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/nutrition">
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-4">
                  <Apple className="h-8 w-8 mb-2 opacity-80" />
                  <h3 className="font-bold mb-1">برنامه تغذیه</h3>
                  <p className="text-xs text-white/70">وعده‌های غذایی</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-5 py-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            <Link href="/coaches">
              <Button variant="outline" className="rounded-full gap-2 whitespace-nowrap border-2">
                <Users className="h-4 w-4" />
                مربیان
              </Button>
            </Link>
            <Link href="/programs">
              <Button variant="outline" className="rounded-full gap-2 whitespace-nowrap border-2">
                <Dumbbell className="h-4 w-4" />
                برنامه‌ها
              </Button>
            </Link>
            <Link href="/challenges">
              <Button variant="outline" className="rounded-full gap-2 whitespace-nowrap border-2">
                <Zap className="h-4 w-4" />
                چالش‌ها
              </Button>
            </Link>
            <Link href="/store">
              <Button variant="outline" className="rounded-full gap-2 whitespace-nowrap border-2">
                <Target className="h-4 w-4" />
                فروشگاه
              </Button>
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
