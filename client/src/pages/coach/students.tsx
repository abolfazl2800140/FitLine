import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
    Search,
    Clock,
    Calendar,
    TrendingUp,
    MessageCircle,
    PenSquare,
    MoreVertical,
    Filter,
    Users,
    ArrowRight,
    Apple,
} from "lucide-react";
import { toPersianNumber, formatDate, formatRelativeTime } from "@/lib/persian";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
    id: string;
    fullName: string;
    avatar: string | null;
    programTitle: string | null;
    nutritionPlanTitle: string | null;
    hasWorkoutProgram: boolean;
    hasNutritionPlan: boolean;
    startDate: string;
    progress: string;
    status?: "active" | "waiting" | "expired";
}

export default function CoachStudentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [, setLocation] = useLocation();

    const { data: user } = useQuery<any>({
        queryKey: ["/api/auth/me"],
    });

    // Fetch real students from API
    const { data: studentsData, isLoading } = useQuery<Student[]>({
        queryKey: ["/api/coach/students"],
        enabled: !!user && user.role === "coach",
    });

    // Transform students data
    const students = (studentsData || []).map((student: any) => {
        const progress = parseFloat(student.progress || "0");
        const hasProgram = student.hasWorkoutProgram || student.hasNutritionPlan;

        let status: "active" | "waiting" | "expired" = "waiting";
        if (!hasProgram) {
            status = "waiting"; // هنوز برنامه‌ای ندارد
        } else if (progress >= 100) {
            status = "expired";
        } else {
            status = "active";
        }
        return {
            ...student,
            progress,
            status,
        };
    });

    const filteredStudents = students.filter((student) => {
        const matchesSearch = student.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab =
            activeTab === "all" ||
            (activeTab === "active" && student.status === "active") ||
            (activeTab === "waiting" && student.status === "waiting") ||
            (activeTab === "expired" && student.status === "expired");
        return matchesSearch && matchesTab;
    });

    const getStatusBadge = (status: Student["status"]) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">فعال</Badge>;
            case "waiting":
                return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">منتظر برنامه</Badge>;
            case "expired":
                return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">پایان یافته</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-primary backdrop-blur-sm">
                <div className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation("/coach")}
                            className="rounded-full text-primary-foreground hover:bg-white/20"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold text-primary-foreground">شاگردان من</h1>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="جستجوی شاگرد..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
                    <TabsList className="w-full grid grid-cols-4 h-10">
                        <TabsTrigger value="all" className="text-xs">
                            همه ({toPersianNumber(students.length)})
                        </TabsTrigger>
                        <TabsTrigger value="active" className="text-xs">
                            فعال ({toPersianNumber(students.filter(s => s.status === "active").length)})
                        </TabsTrigger>
                        <TabsTrigger value="waiting" className="text-xs">
                            منتظر ({toPersianNumber(students.filter(s => s.status === "waiting").length)})
                        </TabsTrigger>
                        <TabsTrigger value="expired" className="text-xs">
                            پایان ({toPersianNumber(students.filter(s => s.status === "expired").length)})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Students List */}
            <div className="px-4 py-4 space-y-3">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-4">
                                    <div className="flex gap-3">
                                        <div className="h-12 w-12 rounded-full bg-muted" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-24 bg-muted rounded" />
                                            <div className="h-3 w-full bg-muted rounded" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">شاگردی یافت نشد</h3>
                            <p className="text-muted-foreground">
                                {students.length === 0
                                    ? "هنوز شاگردی در برنامه‌های شما ثبت‌نام نکرده"
                                    : "نتیجه‌ای برای جستجوی شما یافت نشد"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredStudents.map((student) => (
                        <Card
                            key={student.id}
                            className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setLocation(`/user/${student.id}`)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={student.avatar || undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {student.fullName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold">{student.fullName}</h3>
                                            {getStatusBadge(student.status)}
                                        </div>

                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {student.programTitle && (
                                                <span className="text-xs text-primary">🏋️ {student.programTitle}</span>
                                            )}
                                            {student.nutritionPlanTitle && (
                                                <span className="text-xs text-green-600">🍎 {student.nutritionPlanTitle}</span>
                                            )}
                                            {!student.programTitle && !student.nutritionPlanTitle && (
                                                <span className="text-xs text-muted-foreground">هنوز برنامه‌ای ندارد</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(student.startDate)}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        {student.status !== "waiting" && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-muted-foreground">پیشرفت</span>
                                                    <span className="font-medium">{toPersianNumber(Math.round(student.progress))}%</span>
                                                </div>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all"
                                                        style={{ width: `${student.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenuItem className="flex-row-reverse gap-2" onClick={() => setLocation("/messages")}>
                                                <MessageCircle className="h-4 w-4" />
                                                ارسال پیام
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex-row-reverse gap-2" onClick={() => setLocation(`/coach/program-builder?student=${student.id}`)}>
                                                <PenSquare className="h-4 w-4" />
                                                برنامه تمرینی
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex-row-reverse gap-2" onClick={() => setLocation(`/coach/nutrition-builder?studentId=${student.id}`)}>
                                                <Apple className="h-4 w-4" />
                                                برنامه تغذیه
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex-row-reverse gap-2" onClick={() => setLocation(`/user/${student.id}`)}>
                                                <TrendingUp className="h-4 w-4" />
                                                مشاهده پروفایل
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
