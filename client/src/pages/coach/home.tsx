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

    // Mock data - replace with actual API
    const stats = {
        activeStudents: 12,
        pendingRequests: 3,
        monthlyIncome: 4500000,
        completionRate: 87,
    };

    const recentStudents = [
        { id: "1", name: "علی احمدی", avatar: null, lastActivity: "۲ ساعت پیش", status: "active" },
        { id: "2", name: "سارا محمدی", avatar: null, lastActivity: "۵ ساعت پیش", status: "waiting" },
        { id: "3", name: "رضا کریمی", avatar: null, lastActivity: "دیروز", status: "active" },
    ];

    const pendingRequests = [
        { id: "1", name: "مهدی حسینی", goal: "کاهش وزن", date: "امروز" },
        { id: "2", name: "زهرا نوری", goal: "افزایش حجم", date: "دیروز" },
    ];

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
                        <span className="font-bold">۴.۸</span>
                    </Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <section className="px-5 py-4">
                <div className="grid grid-cols-2 gap-3">
                    <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardContent className="p-4">
                            <Users className="h-5 w-5 text-primary mb-2" />
                            <p className="text-2xl font-bold">{toPersianNumber(stats.activeStudents)}</p>
                            <p className="text-xs text-muted-foreground">شاگرد فعال</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                        <CardContent className="p-4">
                            <AlertCircle className="h-5 w-5 text-orange-500 mb-2" />
                            <p className="text-2xl font-bold">{toPersianNumber(stats.pendingRequests)}</p>
                            <p className="text-xs text-muted-foreground">درخواست جدید</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-500/5">
                        <CardContent className="p-4">
                            <Wallet className="h-5 w-5 text-green-500 mb-2" />
                            <p className="text-lg font-bold">{formatPrice(stats.monthlyIncome)}</p>
                            <p className="text-xs text-muted-foreground">درآمد این ماه</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                        <CardContent className="p-4">
                            <TrendingUp className="h-5 w-5 text-blue-500 mb-2" />
                            <p className="text-2xl font-bold">{toPersianNumber(stats.completionRate)}%</p>
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
                        <Badge variant="secondary">{toPersianNumber(pendingRequests.length)}</Badge>
                    </div>
                    <div className="px-5 space-y-2">
                        {pendingRequests.map((request) => (
                            <Card key={request.id} className="border-orange-500/20 bg-orange-500/5">
                                <CardContent className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{request.name}</p>
                                            <p className="text-xs text-muted-foreground">{request.goal}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" className="h-8">
                                            رد
                                        </Button>
                                        <Button size="sm" className="h-8">
                                            قبول
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
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
