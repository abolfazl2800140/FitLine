import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toPersianNumber, formatRelativeTime } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFollowSound } from "@/hooks/useFollowSound";
import {
    ArrowRight,
    User,
    Calendar,
    MessageSquare,
    Award,
    Image,
    TrendingDown,
    UserPlus,
    UserMinus,
    Users,
    Clock,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function UserProfilePage() {
    const params = useParams<{ id: string }>();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { playFollowSound } = useFollowSound();
    const [isFollowingLocal, setIsFollowingLocal] = useState<boolean | null>(null);

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [params.id]);

    const { data: currentUser } = useQuery<any>({
        queryKey: ["/api/auth/me"],
    });

    const { data: user, isLoading } = useQuery<any>({
        queryKey: ["/api/users", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/users/${params.id}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("User not found");
            return res.json();
        },
        enabled: !!params.id,
    });

    const followMutation = useMutation({
        mutationFn: async () => {
            return apiRequest("POST", `/api/users/${params.id}/follow`);
        },
        onSuccess: () => {
            playFollowSound(); // پخش صدای فالو
            setIsFollowingLocal(true);
            queryClient.invalidateQueries({ queryKey: ["/api/users", params.id] });
            toast({ title: "دنبال شد", description: `${user?.fullName} رو دنبال کردی` });
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: async () => {
            return apiRequest("DELETE", `/api/users/${params.id}/follow`);
        },
        onSuccess: () => {
            setIsFollowingLocal(false);
            queryClient.invalidateQueries({ queryKey: ["/api/users", params.id] });
            toast({ title: "لغو دنبال", description: `دیگه ${user?.fullName} رو دنبال نمیکنی` });
        },
    });

    const isFollowing = isFollowingLocal !== null ? isFollowingLocal : user?.isFollowing;
    const isOwnProfile = currentUser?.id === params.id;

    if (isLoading) {
        return <UserProfileSkeleton />;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">کاربر یافت نشد</p>
                    <Button onClick={() => setLocation("/")}>بازگشت</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24" dir="rtl">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
                <div className="flex items-center justify-between px-4 h-14 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.history.back()}
                        className="rounded-xl text-primary-foreground hover:bg-white/20"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <span className="text-lg italic font-semibold text-primary-foreground">FitLine</span>
                    <div className="w-10" />
                </div>
            </div>
            {/* Spacer for fixed header */}
            <div className="h-14" />

            {/* Profile Header */}
            <div className="bg-gradient-to-b from-primary/10 to-background px-4 pt-6 pb-8">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-lg">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                            {user.fullName?.charAt(0) || "؟"}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold mb-1">{user.fullName}</h2>
                    <p className="text-sm text-muted-foreground mb-3">@{user.username}</p>

                    <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="gap-1">
                            <User className="h-3 w-3" />
                            {user.role === "coach" ? "مربی" : "کاربر"}
                        </Badge>
                        {user.gender && (
                            <Badge variant="outline">
                                {user.gender === "male" ? "آقا" : user.gender === "female" ? "خانم" : ""}
                            </Badge>
                        )}
                    </div>

                    {/* Follow Button */}
                    {currentUser && !isOwnProfile && (
                        <Button
                            variant={isFollowing ? "outline" : "default"}
                            size="sm"
                            className="gap-2"
                            onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
                            disabled={followMutation.isPending || unfollowMutation.isPending}
                        >
                            {isFollowing ? (
                                <>
                                    <UserMinus className="h-4 w-4" />
                                    لغو دنبال
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    دنبال کردن
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="px-4 -mt-4">
                <Card className="border border-border/50">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-3 text-center">
                            <div>
                                <p className="text-xl font-bold text-primary">
                                    {toPersianNumber(user.followers || 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">دنبال‌کننده</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-primary">
                                    {toPersianNumber(user.following || 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">دنبال‌شده</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-primary">
                                    {toPersianNumber(user.questionCount || 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">سوال</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-primary">
                                    {toPersianNumber(user.answerCount || 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">پاسخ</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bio */}
            {user.bio && (
                <div className="px-4 mt-4">
                    <Card className="border border-border/50">
                        <CardContent className="p-4">
                            <h3 className="font-bold mb-2">درباره</h3>
                            <p className="text-sm text-muted-foreground leading-6">{user.bio}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Member Since */}
            <div className="px-4 mt-4">
                <Card className="border border-border/50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>عضویت از {formatRelativeTime(user.createdAt)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="px-4 mt-6">
                <Tabs defaultValue="progress" className="w-full">
                    <TabsList className="w-full bg-muted/50 p-1 rounded-xl grid grid-cols-4">
                        <TabsTrigger value="progress" className="rounded-lg text-xs">
                            پیشرفت
                        </TabsTrigger>
                        <TabsTrigger value="photos" className="rounded-lg text-xs">
                            عکس‌ها
                        </TabsTrigger>
                        <TabsTrigger value="questions" className="rounded-lg text-xs">
                            سوالات
                        </TabsTrigger>
                        <TabsTrigger value="answers" className="rounded-lg text-xs">
                            پاسخ‌ها
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="progress" className="mt-4">
                        {(user.progressMetrics || []).length > 0 ? (
                            <Card className="border border-border/50">
                                <CardContent className="p-4">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <TrendingDown className="h-5 w-5 text-primary" />
                                        نمودار پیشرفت
                                    </h3>
                                    <div className="h-64" dir="ltr">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={(() => {
                                                    const metrics = user.progressMetrics || [];
                                                    const grouped: Record<string, any> = {};
                                                    metrics.forEach((m: any) => {
                                                        const date = new Date(m.recordedAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
                                                        if (!grouped[date]) grouped[date] = { date };
                                                        if (m.metricType === 'weight') grouped[date].weight = parseFloat(m.value);
                                                        if (m.metricType === 'bodyFat') grouped[date].bodyFat = parseFloat(m.value);
                                                        if (m.metricType === 'muscleMass') grouped[date].muscleMass = parseFloat(m.value);
                                                    });
                                                    return Object.values(grouped).slice(-12);
                                                })()}
                                                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                                <YAxis tick={{ fontSize: 10 }} />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="weight" name="وزن (kg)" stroke="#10b981" strokeWidth={2} dot={false} />
                                                <Line type="monotone" dataKey="bodyFat" name="چربی (%)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                                <Line type="monotone" dataKey="muscleMass" name="عضله (kg)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center py-8">
                                <TrendingDown className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-muted-foreground">داده پیشرفتی ثبت نشده</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="photos" className="mt-4">
                        {(user.progressPhotos || []).length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {user.progressPhotos.map((photo: any) => (
                                    <Card key={photo.id} className="border border-border/50 overflow-hidden">
                                        <img
                                            src={photo.imageUrl}
                                            alt="Progress"
                                            className="w-full h-48 object-cover"
                                        />
                                        <CardContent className="p-3">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {new Date(photo.createdAt).toLocaleDateString('fa-IR')}
                                            </p>
                                            {photo.weight && (
                                                <p className="text-xs">وزن: {toPersianNumber(photo.weight)} کیلو</p>
                                            )}
                                            {photo.notes && (
                                                <p className="text-xs text-primary mt-1">{photo.notes}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Image className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-muted-foreground">عکس پیشرفتی ثبت نشده</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="questions" className="mt-4 space-y-3">
                        {(user.questions || []).length > 0 ? (
                            user.questions.map((q: any) => (
                                <Card
                                    key={q.id}
                                    className="border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setLocation(`/education/${q.id}`)}
                                >
                                    <CardContent className="p-4 text-right">
                                        <h4 className="font-medium mb-2">{q.title}</h4>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground justify-start">
                                            <span>{toPersianNumber(q.voteCount || 0)} رای</span>
                                            <span>•</span>
                                            <span>{toPersianNumber(q.answerCount || 0)} پاسخ</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-muted-foreground">سوالی ثبت نشده</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="answers" className="mt-4 space-y-3">
                        {(user.answers || []).length > 0 ? (
                            user.answers.map((a: any) => (
                                <Card
                                    key={a.id}
                                    className="border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setLocation(`/education/${a.questionId}`)}
                                >
                                    <CardContent className="p-4 text-right">
                                        <p className="text-sm line-clamp-2 mb-2">{a.content}</p>
                                        <div className="flex items-center gap-2 justify-start">
                                            {a.isBestAnswer && (
                                                <Badge className="gap-1 text-xs" variant="default">
                                                    <Award className="h-3 w-3" />
                                                    بهترین پاسخ
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {toPersianNumber(a.voteCount || 0)} رای
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-muted-foreground">پاسخی ثبت نشده</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function UserProfileSkeleton() {
    return (
        <div className="min-h-screen bg-background" dir="rtl">
            <div className="h-14 border-b border-border/50" />
            <div className="px-4 pt-6 pb-8 flex flex-col items-center">
                <Skeleton className="h-24 w-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
}
