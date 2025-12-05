import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { CoachCard, CoachCardSkeleton } from "@/components/ui/coach-card";
import { PostCard, PostCardSkeleton } from "@/components/ui/post-card";
import { ProgramCard, ProgramCardSkeleton } from "@/components/ui/program-card";
import { ChallengeCard, ChallengeCardSkeleton } from "@/components/ui/challenge-card";
import { translations, toPersianNumber } from "@/lib/persian";
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
  ArrowLeft,
  Play,
  Calendar,
  Clock
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

  // If user is a coach, show coach dashboard
  if (user?.role === "coach") {
    return <CoachHomePage />;
  }

  // App-style dashboard for logged-in users (athletes)
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Welcome Header */}
        <section className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{user.fullName || "کاربر"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold">۱۲ روز</span>
              </Badge>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="px-5 py-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
              <Dumbbell className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">۵</p>
              <p className="text-[10px] text-muted-foreground">تمرین</p>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
              <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
              <p className="text-lg font-bold">۲.۴K</p>
              <p className="text-[10px] text-muted-foreground">کالری</p>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
              <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-lg font-bold">#۱۲</p>
              <p className="text-[10px] text-muted-foreground">رتبه</p>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-lg font-bold">۸۵%</p>
              <p className="text-[10px] text-muted-foreground">پیشرفت</p>
            </div>
          </div>
        </section>

        {/* Today's Workout Card */}
        <section className="px-5 py-2">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">تمرین امروز</p>
                  <h3 className="text-lg font-bold mb-2">تمرین بالاتنه - روز ۳</h3>
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ۴۵ دقیقه
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-4 w-4" />
                      ۳۵۰ کالری
                    </span>
                  </div>
                </div>
                <Button size="lg" variant="secondary" className="rounded-full h-14 w-14 p-0 shadow-lg">
                  <Play className="h-6 w-6 mr-0.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
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
