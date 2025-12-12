import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatDate, toPersianNumber } from "@/lib/persian";
import {
    ArrowRight,
    Dumbbell,
    Calendar,
    Clock,
    ChevronLeft,
    Play,
} from "lucide-react";

export default function MyProgramsPage() {
    const [, setLocation] = useLocation();

    const { data: programs, isLoading } = useQuery<any[]>({
        queryKey: ["/api/user/programs/details"],
    });

    return (
        <div className="min-h-screen bg-background pb-20" dir="rtl">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
                <div className="flex items-center gap-3 px-4 h-14">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/")}
                        className="rounded-full text-primary-foreground hover:bg-white/20"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold text-primary-foreground">برنامه‌های من</h1>
                </div>
            </div>
            <div className="h-14" />

            <div className="container max-w-2xl px-4 py-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <div className="h-16 w-16 rounded-xl bg-muted" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 w-32 bg-muted rounded" />
                                            <div className="h-4 w-24 bg-muted rounded" />
                                            <div className="h-2 w-full bg-muted rounded" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : programs && programs.length > 0 ? (
                    <div className="space-y-4">
                        {programs.map((enrollment: any) => {
                            const progress = parseFloat(enrollment.progress || "0");
                            return (
                                <Card
                                    key={enrollment.id}
                                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => setLocation(`/program/${enrollment.program.id}`)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Dumbbell className="h-8 w-8 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-bold text-lg">{enrollment.program.title}</h3>
                                                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                                                </div>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={enrollment.program.coach?.avatar} />
                                                        <AvatarFallback className="text-xs">
                                                            {enrollment.program.coach?.fullName?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-muted-foreground">
                                                        {enrollment.program.coach?.fullName}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {toPersianNumber(enrollment.program.durationWeeks)} هفته
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Dumbbell className="h-3 w-3" />
                                                        {toPersianNumber(enrollment.program.totalDays || 0)} روز
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">پیشرفت</span>
                                                        <span className="font-medium">{toPersianNumber(Math.round(progress))}%</span>
                                                    </div>
                                                    <Progress value={progress} className="h-2" />
                                                </div>
                                            </div>
                                        </div>

                                        <Button className="w-full mt-4 gap-2">
                                            <Play className="h-4 w-4" />
                                            شروع تمرین
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">برنامه‌ای ندارید</h3>
                            <p className="text-muted-foreground mb-4">
                                از یک مربی درخواست برنامه بدید
                            </p>
                            <Button onClick={() => setLocation("/coaches")}>
                                مشاهده مربیان
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
