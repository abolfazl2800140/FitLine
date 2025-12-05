import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
    Search,
    Clock,
    Calendar,
    TrendingUp,
    MessageCircle,
    PenSquare,
    MoreVertical,
    Filter,
} from "lucide-react";
import { toPersianNumber } from "@/lib/persian";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
    id: string;
    name: string;
    avatar: string | null;
    goal: string;
    startDate: string;
    progress: number;
    lastActivity: string;
    status: "active" | "waiting" | "expired";
    currentProgram?: string;
}

export default function CoachStudentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // Mock data - replace with actual API
    const mockStudents: Student[] = [
        {
            id: "1",
            name: "علی احمدی",
            avatar: null,
            goal: "کاهش وزن",
            startDate: "۱۴۰۳/۰۸/۱۵",
            progress: 65,
            lastActivity: "۲ ساعت پیش",
            status: "active",
            currentProgram: "برنامه کاهش وزن ۸ هفته‌ای",
        },
        {
            id: "2",
            name: "سارا محمدی",
            avatar: null,
            goal: "افزایش حجم",
            startDate: "۱۴۰۳/۰۹/۰۱",
            progress: 30,
            lastActivity: "۵ ساعت پیش",
            status: "waiting",
        },
        {
            id: "3",
            name: "رضا کریمی",
            avatar: null,
            goal: "تناسب اندام",
            startDate: "۱۴۰۳/۰۷/۲۰",
            progress: 85,
            lastActivity: "دیروز",
            status: "active",
            currentProgram: "برنامه فیتنس عمومی",
        },
        {
            id: "4",
            name: "مریم حسینی",
            avatar: null,
            goal: "افزایش قدرت",
            startDate: "۱۴۰۳/۰۶/۱۰",
            progress: 100,
            lastActivity: "۳ روز پیش",
            status: "expired",
            currentProgram: "برنامه قدرتی",
        },
    ];

    const filteredStudents = mockStudents.filter((student) => {
        const matchesSearch = student.name.includes(searchQuery);
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
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
                <div className="px-4 py-3">
                    <h1 className="text-lg font-bold mb-3">شاگردهای من</h1>

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
                            همه ({toPersianNumber(mockStudents.length)})
                        </TabsTrigger>
                        <TabsTrigger value="active" className="text-xs">
                            فعال ({toPersianNumber(mockStudents.filter(s => s.status === "active").length)})
                        </TabsTrigger>
                        <TabsTrigger value="waiting" className="text-xs">
                            منتظر ({toPersianNumber(mockStudents.filter(s => s.status === "waiting").length)})
                        </TabsTrigger>
                        <TabsTrigger value="expired" className="text-xs">
                            پایان ({toPersianNumber(mockStudents.filter(s => s.status === "expired").length)})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Students List */}
            <div className="px-4 py-4 space-y-3">
                {filteredStudents.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">شاگردی یافت نشد</p>
                    </div>
                ) : (
                    filteredStudents.map((student) => (
                        <Card key={student.id} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={student.avatar || undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {student.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold">{student.name}</h3>
                                            {getStatusBadge(student.status)}
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-2">{student.goal}</p>

                                        {student.currentProgram && (
                                            <p className="text-xs text-primary mb-2">📋 {student.currentProgram}</p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {student.startDate}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {student.lastActivity}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        {student.status !== "waiting" && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-muted-foreground">پیشرفت</span>
                                                    <span className="font-medium">{toPersianNumber(student.progress)}%</span>
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
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="gap-2">
                                                <MessageCircle className="h-4 w-4" />
                                                ارسال پیام
                                            </DropdownMenuItem>
                                            <Link href={`/coach/program-builder?student=${student.id}`}>
                                                <DropdownMenuItem className="gap-2">
                                                    <PenSquare className="h-4 w-4" />
                                                    نوشتن برنامه
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem className="gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                مشاهده پیشرفت
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
