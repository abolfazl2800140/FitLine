import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
    Users,
    TrendingUp,
    Wallet,
    ChevronLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    PenSquare,
    Star,
    Calendar,
} from "lucide-react";
import { toPersianNumber, formatPrice } from "@/lib/persian";

export default function CoachHomePage() {
    const { data: user } = useQuery<any>({
        queryKey: ["/api/auth/me"],
    });

    // Fetch real stats from API
    const { data: stats } = useQuery<{
        activeStudents: number;
        pendingRequests: number;
        monthlyIncome: number;
        completionRate: number;
        rating: string;
        reviewCount: number;
    }>({
        queryKey: ["/api/coach/stats"],
        enabled: !!user && user.role === "coach",
    });

    // Fetch real students from API
    const { data: students } = useQuery<any[]>({
        queryKey: ["/api/coach/students"],
        enabled: !!user && user.role === "coach",
    });

    // Fetch pending requests count
    const { data: pendingCountData } = useQuery<{ count: number }>({
        queryKey: ["/api/coach/requests/pending-count"],
        enabled: !!user && user.role === "coach",
    });

    // Fetch recent requests
    const { data: requests } = useQuery<any[]>({
        queryKey: ["/api/coach/requests"],
        enabled: !!user && user.role === "coach",
    });

    // Default values when data is loading
    const pendingCount = pendingCountData?.count || 0;
    const coachStats = {
        activeStudents: stats?.activeStudents || 0,
        pendingRequests: pendingCount,
        monthlyIncome: stats?.monthlyIncome || 0,
        completionRate: stats?.completionRate || 0,
    };

    // Transform students data for display
    const recentStudents = (students || []).slice(0, 5).map((student: any) => ({
        id: student.id,
        name: student.fullName,
        avatar: student.avatar,
        lastActivity: student.programTitle || "برنامه جدید",
        status: student.progress >= 50 ? "active" : "waiting",
    }));

    // Get pending requests for display
    const pendingRequests = (requests || []).filter((r: any) => r.status === "pending").slice(0, 3);

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-sm">سلام 👋</p>
                        <h1 className="text-xl font-bold">{user?.fullName || "مربی"}</h1>
                    </div>
                    <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{toPersianNumber(parseFloat(stats?.rating || "0").toFixed(1))}</span>
                    </Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <section className="px-5 py-4">
                <div className="grid grid-cols-2 gap-3">
                    <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardContent className="p-4">
                            <Users className="h-5 w-5 text-primary mb-2" />
                            <p className="text-2xl font-bold">{toPersianNumber(coachStats.activeStudents)}</p>
                            <p className="text-xs text-muted-foreground">شاگرد فعال</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                        <CardContent className="p-4">
                            <AlertCircle className="h-5 w-5 text-orange-500 mb-2" />
                            <p className="text-2xl font-bold">{toPersianNumber(coachStats.pendingRequests)}</p>
                            <p className="text-xs text-muted-foreground">درخواست جدید</p>
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
                            <p className="text-xs text-muted-foreground">نرخ تکمیل</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="px-5 py-2">
                <Link href="/coach/program-builder">
                    <Card className="border-0 bg-gradient-to-br from-primary to-primary/80 text-white cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <PenSquare className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold">نوشتن برنامه جدید</p>
                                    <p className="text-sm text-white/70">برای شاگردهات برنامه بنویس</p>
                                </div>
                            </div>
                            <ChevronLeft className="h-5 w-5" />
                        </CardContent>
                    </Card>
                </Link>
            </section>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <section className="py-4">
                    <div className="flex items-center justify-between px-5 mb-3">
                        <h2 className="font-bold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            درخواست‌های جدید
                        </h2>
                        <Link href="/coach/requests">
                            <Button variant="ghost" size="sm" className="gap-1 text-primary">
                                همه ({toPersianNumber(pendingCount)})
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="px-5 space-y-2">
                        {pendingRequests.map((request: any) => (
                            <Link key={request.id} href="/coach/requests">
                                <Card className="border-orange-500/20 bg-orange-500/5 cursor-pointer hover:bg-orange-500/10 transition-colors">
                                    <CardContent className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={request.user?.avatar} />
                                                <AvatarFallback>{request.user?.fullName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{request.user?.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{request.goal}</p>
                                            </div>
                                        </div>
                                        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Recent Students */}
            <section className="py-4">
                <div className="flex items-center justify-between px-5 mb-3">
                    <h2 className="font-bold">شاگردهای اخیر</h2>
                    <Link href="/coach/students">
                        <Button variant="ghost" size="sm" className="gap-1 text-primary">
                            همه
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="px-5 space-y-2">
                    {recentStudents.map((student) => (
                        <Card key={student.id}>
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={student.avatar || undefined} />
                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {student.lastActivity}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={student.status === "active" ? "default" : "secondary"}>
                                    {student.status === "active" ? "فعال" : "منتظر برنامه"}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
