import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PostCard, PostCardSkeleton } from "@/components/ui/post-card";
import { translations, toPersianNumber, formatDate } from "@/lib/persian";
import { Link } from "wouter";
import {
  User,
  Settings,
  Camera,
  Edit,
  Users,
  CalendarDays,
  Trophy,
  Dumbbell,
  TrendingUp,
  Award,
  Image as ImageIcon,
  Flame,
  FileText,
  Scale,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockWeightData = [
  { date: "فروردین", weight: 85 },
  { date: "اردیبهشت", weight: 83 },
  { date: "خرداد", weight: 81 },
  { date: "تیر", weight: 79 },
  { date: "مرداد", weight: 78 },
  { date: "شهریور", weight: 76 },
];

const mockBadges = [
  { id: "1", name: "اولین تمرین", icon: "dumbbell", category: "شروع" },
  { id: "2", name: "۷ روز متوالی", icon: "flame", category: "تداوم" },
  { id: "3", name: "اولین پست", icon: "filetext", category: "اجتماعی" },
  { id: "4", name: "۱۰ کیلو کاهش وزن", icon: "scale", category: "پیشرفت" },
];

const badgeIcons: Record<string, React.ReactNode> = {
  dumbbell: <Dumbbell className="h-8 w-8 text-primary" />,
  flame: <Flame className="h-8 w-8 text-orange-500" />,
  filetext: <FileText className="h-8 w-8 text-blue-500" />,
  scale: <Scale className="h-8 w-8 text-green-500" />,
};

export default function ProfilePage() {
  const [tab, setTab] = useState("timeline");

  const { data: currentUser, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: userPosts, isLoading: postsLoading } = useQuery<any[]>({
    queryKey: ["/api/user/posts"],
    enabled: !!currentUser,
  });

  const { data: userPrograms } = useQuery<any[]>({
    queryKey: ["/api/user/programs"],
    enabled: !!currentUser,
  });

  const { data: progressPhotos } = useQuery<any[]>({
    queryKey: ["/api/user/progress-photos"],
    enabled: !!currentUser,
  });

  const { data: userBadges } = useQuery<any[]>({
    queryKey: ["/api/user/badges"],
    enabled: !!currentUser,
  });

  if (!currentUser && !userLoading) {
    return (
      <div className="container max-w-4xl px-4 md:px-6 py-6">
        <Card className="text-center py-16">
          <CardContent>
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">ابتدا وارد شوید</h3>
            <p className="text-muted-foreground mb-4">
              برای مشاهده پروفایل ابتدا وارد حساب کاربری شوید
            </p>
            <Link href="/login">
              <Button>{translations.auth.login}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const badges = userBadges || mockBadges;

  return (
    <div className="container max-w-4xl px-4 md:px-6 py-6">
      <Card className="overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={currentUser?.avatar || undefined} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {currentUser?.fullName?.charAt(0) || "؟"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 left-0 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 text-center sm:text-right">
              <h1 className="text-2xl font-bold">{currentUser?.fullName}</h1>
              <p className="text-muted-foreground">@{currentUser?.username}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/settings">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">{translations.nav.settings}</span>
                </Button>
              </Link>
              <Button size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">{translations.profile.editProfile}</span>
              </Button>
            </div>
          </div>

          {currentUser?.bio && (
            <p className="mt-4 text-muted-foreground">{currentUser.bio}</p>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{toPersianNumber(userPosts?.length || 0)}</p>
              <p className="text-sm text-muted-foreground">{translations.profile.posts}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{toPersianNumber(currentUser?.followerCount || 0)}</p>
              <p className="text-sm text-muted-foreground">{translations.profile.followers}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{toPersianNumber(currentUser?.followingCount || 0)}</p>
              <p className="text-sm text-muted-foreground">{translations.profile.following}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{toPersianNumber(userPrograms?.length || 0)}</p>
              <p className="text-xs text-muted-foreground">برنامه فعال</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{currentUser?.weight || "—"}</p>
              <p className="text-xs text-muted-foreground">کیلوگرم</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{toPersianNumber(badges.length)}</p>
              <p className="text-xs text-muted-foreground">نشان</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{toPersianNumber(progressPhotos?.length || 0)}</p>
              <p className="text-xs text-muted-foreground">ثبت پیشرفت</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="timeline" data-testid="tab-timeline">
            {translations.profile.timeline}
          </TabsTrigger>
          <TabsTrigger value="posts" data-testid="tab-posts">
            {translations.profile.posts}
          </TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">
            {translations.profile.progress}
          </TabsTrigger>
          <TabsTrigger value="achievements" data-testid="tab-achievements">
            {translations.profile.achievements}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                نمودار وزن
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockWeightData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <div className="space-y-4">
            {postsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            ) : userPosts && userPosts.length > 0 ? (
              userPosts.map((post: any) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  userId={post.userId}
                  userName={currentUser?.fullName || "کاربر"}
                  userAvatar={currentUser?.avatar}
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
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">هنوز پستی ندارید</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {progressPhotos && progressPhotos.length > 0 ? (
              progressPhotos.map((photo: any) => (
                <Card key={photo.id} className="overflow-hidden group cursor-pointer">
                  <div className="aspect-square relative">
                    <img
                      src={photo.imageUrl}
                      alt="Progress"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      {photo.weight && (
                        <p className="font-bold">{photo.weight} کیلو</p>
                      )}
                      <p className="text-sm">{formatDate(photo.createdAt)}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="col-span-full text-center py-12">
                <CardContent>
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">تصویری ثبت نشده</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    تصاویر پیشرفت ماهانه خود را ثبت کنید
                  </p>
                  <Button>{translations.profile.uploadPhoto}</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map((badge: any) => (
              <Card key={badge.id} className="text-center hover-elevate">
                <CardContent className="p-4">
                  <div className="mb-2 flex justify-center">
                    {badgeIcons[badge.icon] || <Award className="h-8 w-8 text-primary" />}
                  </div>
                  <p className="font-medium text-sm">{badge.name}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {badge.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
