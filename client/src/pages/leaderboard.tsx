import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaderboard, PointsDisplay } from "@/components/ui/points-display";
import { useLocation } from "wouter";
import { ArrowRight, Trophy, Star, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toPersianNumber } from "@/lib/persian";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const POINT_DESCRIPTIONS = {
    user: [
        { action: "پرسیدن سوال", points: 2 },
        { action: "پاسخ دادن به سوال", points: 5 },
        { action: "پاسخ برگزیده شدن", points: 10 },
        { action: "تکمیل تمرین", points: 3 },
        { action: "شرکت در چالش", points: 5 },
        { action: "برنده شدن چالش", points: 20 },
    ],
    coach: [
        { action: "پاسخ دادن به سوال", points: 5 },
        { action: "پاسخ برگزیده شدن", points: 15 },
        { action: "ایجاد برنامه جدید", points: 10 },
        { action: "گرفتن شاگرد جدید", points: 20 },
        { action: "دریافت نظر مثبت", points: 5 },
    ],
};

export default function LeaderboardPage() {
    const [, setLocation] = useLocation();

    const { data: user } = useQuery<any>({
        queryKey: ["/api/auth/me"],
    });

    return (
        <div className="min-h-screen bg-background pb-24" dir="rtl">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
                <div className="flex items-center justify-between px-4 h-14">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.history.back()}
                        className="text-primary-foreground hover:bg-white/20"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <span className="text-lg font-semibold text-primary-foreground">جدول امتیازات</span>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary-foreground hover:bg-white/20"
                            >
                                <Info className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>

                        <DialogContent dir="rtl" className="max-w-sm">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-primary fill-primary" />
                                    نحوه کسب امتیاز
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2 text-sm">برای ورزشکاران:</h4>
                                    <div className="space-y-1">
                                        {POINT_DESCRIPTIONS.user.map((item) => (
                                            <div key={item.action} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{item.action}</span>
                                                <span className="text-primary font-bold">+{toPersianNumber(item.points)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 text-sm">برای مربیان:</h4>
                                    <div className="space-y-1">
                                        {POINT_DESCRIPTIONS.coach.map((item) => (
                                            <div key={item.action} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{item.action}</span>
                                                <span className="text-primary font-bold">+{toPersianNumber(item.points)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="h-14" />

            <div className="container max-w-lg px-4 py-6">
                {/* User's Points Card */}
                {user && (
                    <Card className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">امتیاز شما</p>
                                    <PointsDisplay size="lg" className="mt-1" />
                                </div>
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Trophy className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Leaderboard */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            برترین‌ها
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Leaderboard limit={20} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
