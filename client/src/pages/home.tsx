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
  ArrowLeft
} from "lucide-react";
import heroImage from "@assets/generated_images/hero_gym_workout_scene.png";

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

  return (
    <div className="min-h-screen">
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="FitLine Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </div>

        <div className="relative container h-full flex items-center px-4 md:px-6">
          <div className="max-w-lg">
            <Badge className="mb-4 text-sm" variant="secondary">
              بزرگترین پلتفرم فیتنس ایران
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="text-gradient-orange">فیت‌لاین</span>
              <br />
              <span className="text-foreground">مسیر تناسب‌اندام تو</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              بهترین مربیان، برنامه‌های تمرینی حرفه‌ای، و جامعه‌ای از ورزشکاران. همین الان شروع کن!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/coaches">
                <Button size="lg" className="gap-2 glow-orange">
                  <Users className="h-5 w-5" />
                  {translations.hero.exploreCoaches}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="gap-2 bg-background/30 backdrop-blur-sm">
                  {translations.hero.joinNow}
                  <ArrowLeft className="h-4 w-4 rtl-flip" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {user && (
        <section className="container px-4 md:px-6 -mt-16 relative z-10 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              title="تمرین‌های این هفته" 
              value={5}
              subtitle="از ۷ روز"
              icon={Dumbbell}
              trend={{ value: 20, isPositive: true }}
            />
            <StatCard 
              title="کالری سوزانده" 
              value="۲,۴۵۰"
              subtitle="کیلوکالری"
              icon={Flame}
            />
            <StatCard 
              title="رتبه در لیگ" 
              value={12}
              subtitle="از ۱۰۰ نفر"
              icon={Trophy}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard 
              title="پیشرفت ماهانه" 
              value="۸۵%"
              icon={TrendingUp}
            />
          </div>
        </section>
      )}

      <section className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{translations.coaches.title}</h2>
            <p className="text-muted-foreground text-sm">برترین مربیان فیتنس</p>
          </div>
          <Link href="/coaches">
            <Button variant="ghost" className="gap-1">
              {translations.common.seeAll}
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coachesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <CoachCardSkeleton key={i} />
            ))
          ) : coaches && coaches.length > 0 ? (
            coaches.slice(0, 4).map((coach: any) => (
              <CoachCard
                key={coach.id}
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
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">مربیان به زودی اضافه می‌شوند</p>
            </div>
          )}
        </div>
      </section>

      <section className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{translations.programs.title}</h2>
            <p className="text-muted-foreground text-sm">برنامه‌های حرفه‌ای تمرین</p>
          </div>
          <Link href="/programs">
            <Button variant="ghost" className="gap-1">
              {translations.common.seeAll}
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <ProgramCardSkeleton key={i} />
            ))
          ) : programs && programs.length > 0 ? (
            programs.slice(0, 3).map((program: any) => (
              <ProgramCard
                key={program.id}
                id={program.id}
                title={program.title}
                coachName={program.coach?.fullName || "مربی"}
                coachAvatar={program.coach?.avatar}
                coverImage={program.coverImage}
                difficulty={program.difficulty || "beginner"}
                durationWeeks={program.durationWeeks}
                price={program.price}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">برنامه‌ها به زودی اضافه می‌شوند</p>
            </div>
          )}
        </div>
      </section>

      <section className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{translations.challenges.title}</h2>
            <p className="text-muted-foreground text-sm">چالش‌های فعال</p>
          </div>
          <Link href="/challenges">
            <Button variant="ghost" className="gap-1">
              {translations.common.seeAll}
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {challengesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <ChallengeCardSkeleton key={i} />
            ))
          ) : challenges && challenges.length > 0 ? (
            challenges.slice(0, 3).map((challenge: any) => (
              <ChallengeCard
                key={challenge.id}
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
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">چالش‌ها به زودی اضافه می‌شوند</p>
            </div>
          )}
        </div>
      </section>

      <section className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{translations.feed.title}</h2>
            <p className="text-muted-foreground text-sm">جدیدترین پست‌ها</p>
          </div>
          <Link href="/feed">
            <Button variant="ghost" className="gap-1">
              {translations.common.seeAll}
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
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
            <Card className="text-center py-12">
              <CardContent>
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">پست‌ها به زودی اضافه می‌شوند</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="container px-4 md:px-6 py-12">
        <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-right">
              <h2 className="text-3xl font-bold mb-4">
                آماده شروع هستید؟
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                همین الان به فیت‌لاین بپیوندید و مسیر تناسب‌اندام خود را شروع کنید.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Link href="/register">
                  <Button size="lg" className="glow-orange">
                    {translations.auth.register}
                  </Button>
                </Link>
                <Link href="/coaches">
                  <Button size="lg" variant="outline">
                    مشاهده مربیان
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                  <Dumbbell className="h-16 w-16 text-primary" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
