import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, toPersianNumber } from "@/lib/persian";
import { useToast } from "@/hooks/use-toast";
import { CoachingRequestModal } from "@/components/coaching-request-modal";
import {
    ArrowRight,
    Star,
    BadgeCheck,
    Users,
    Clock,
    Calendar,
    MessageCircle,
    Share2,
    Heart,
    MapPin,
    Award,
    Dumbbell,
    X,
} from "lucide-react";

export default function CoachDetailPage() {
    const params = useParams<{ id: string }>();
    const [, setLocation] = useLocation();
    const [showAvatar, setShowAvatar] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showAvatar) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [showAvatar]);

    const { data: coach, isLoading, error } = useQuery<any>({
        queryKey: ["/api/coaches", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/coaches/${params.id}`, {
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error("Coach not found");
            }
            return res.json();
        },
        enabled: !!params.id,
    });

    const likeMutation = useMutation({
        mutationFn: async () => {
            const method = coach?.isLiked ? "DELETE" : "POST";
            const res = await fetch(`/api/coaches/${params.id}/like`, {
                method,
                credentials: "include",
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "خطا در ثبت لایک");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/coaches", params.id] });
        },
        onError: (error: Error) => {
            toast({
                title: "خطا",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    if (isLoading) {
        return <CoachDetailSkeleton />;
    }

    if (error || !coach) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">مربی یافت نشد</p>
                    <Button onClick={() => setLocation("/coaches")}>
                        بازگشت به لیست مربیان
                    </Button>
                </div>
            </div>
        );
    }

    const ratingNum =
        typeof coach.rating === "string"
            ? parseFloat(coach.rating)
            : coach.rating || 4.5;

    return (
        <div className="min-h-screen bg-background pb-28" dir="rtl">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
                <div className="flex items-center justify-between px-4 h-14 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/coaches")}
                        className="rounded-full text-primary-foreground hover:bg-white/20"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>

                    <span className="text-lg italic font-semibold text-primary-foreground">FitLine</span>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full text-primary-foreground hover:bg-white/20">
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-primary-foreground hover:bg-white/20"
                            onClick={() => likeMutation.mutate()}
                            disabled={likeMutation.isPending}
                        >
                            <Heart
                                className={`h-5 w-5 transition-colors ${coach?.isLiked
                                    ? "fill-red-500 text-red-500"
                                    : ""
                                    }`}
                            />
                        </Button>
                    </div>
                </div>
            </div>
            {/* Spacer for fixed header */}
            <div className="h-14" />

            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 pt-6 pb-4"
            >
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-4">
                        <Avatar
                            className="h-28 w-28 border-4 border-primary/20 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => coach.user?.avatar && setShowAvatar(true)}
                        >
                            <AvatarImage
                                src={coach.user?.avatar || undefined}
                                alt={coach.user?.fullName}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                                {coach.user?.fullName?.charAt(0) || "م"}
                            </AvatarFallback>
                        </Avatar>
                        {coach.isVerified && (
                            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 shadow-lg border-2 border-background">
                                <BadgeCheck className="h-4 w-4 text-white" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold mb-2">
                        {coach.user?.fullName || "مربی"}
                    </h1>

                    <Badge className="mb-3 px-4 py-1.5 text-sm bg-primary text-white">
                        {coach.specialty || "بدنسازی"}
                    </Badge>

                    <div className="flex items-center gap-2 text-sm">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-lg">
                            {toPersianNumber(ratingNum.toFixed(1))}
                        </span>
                        <span className="text-muted-foreground">
                            ({toPersianNumber(coach.reviewCount || 89)})
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card rounded-2xl p-4 text-center border border-border/50">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-xl font-bold">
                            {toPersianNumber(coach.experience || 10)}
                        </p>
                        <p className="text-xs text-muted-foreground">سال تجربه</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 text-center border border-border/50">
                        <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-xl font-bold">
                            {toPersianNumber(coach.clientCount || 150)}
                        </p>
                        <p className="text-xs text-muted-foreground">شاگرد</p>
                    </div>
                    <div className="bg-card rounded-2xl p-4 text-center border border-border/50">
                        <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-xl font-bold">
                            {toPersianNumber(coach.programCount || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">برنامه</p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="about" className="px-5" dir="rtl">
                <TabsList className="w-full bg-muted/50 p-1 rounded-xl grid grid-cols-3">
                    <TabsTrigger value="about" className="rounded-lg text-sm">
                        درباره
                    </TabsTrigger>
                    <TabsTrigger value="programs" className="rounded-lg text-sm">
                        برنامه‌ها
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-lg text-sm">
                        نظرات
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-4 space-y-4">
                    <Card className="border border-border/50 bg-card">
                        <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-3 text-right">بیوگرافی</h3>
                            <p className="text-sm text-muted-foreground leading-7 text-right">
                                {coach.bio ||
                                    "مربی حرفه‌ای با سال‌ها تجربه در زمینه بدنسازی و تناسب اندام. متخصص در طراحی برنامه‌های تمرینی شخصی‌سازی شده برای رسیدن به اهداف ورزشی شما."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/50 bg-card">
                        <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-3 text-right">
                                مدارک و گواهینامه‌ها
                            </h3>
                            <div className="space-y-3">
                                {(
                                    coach.certifications || [
                                        "مدرک مربیگری درجه یک بدنسازی",
                                        "گواهینامه تغذیه ورزشی",
                                        "مدرک CPR و کمک‌های اولیه",
                                    ]
                                ).map((cert: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>{cert}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border/50 bg-card">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm">
                                    {coach.location || "تهران، ایران"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="programs" className="mt-4 space-y-3">
                    {(coach.programs || []).length > 0 ? (
                        coach.programs.map((program: any) => (
                            <Card
                                key={program.id}
                                className="border border-border/50 bg-card overflow-hidden"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Dumbbell className="h-7 w-7 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-base">{program.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {toPersianNumber(program.durationWeeks)} هفته
                                            </p>
                                        </div>
                                        <div className="text-left flex-shrink-0">
                                            <p className="font-bold text-primary text-lg">
                                                {formatPrice(program.price)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">تومان</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Dumbbell className="h-14 w-14 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground">برنامه‌ای هنوز اضافه نشده</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-4 space-y-3">
                    {(coach.reviews || []).length > 0 ? (
                        coach.reviews.map((review: any) => (
                            <Card key={review.id} className="border border-border/50 bg-card">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => review.user?.id && setLocation(`/user/${review.user.id}`)}
                                        >
                                            <Avatar className="h-11 w-11 flex-shrink-0">
                                                <AvatarImage src={review.user?.avatar} />
                                                <AvatarFallback className="bg-muted">
                                                    {review.user?.fullName?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span
                                                    className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => review.user?.id && setLocation(`/user/${review.user.id}`)}
                                                >
                                                    {review.user?.fullName}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm font-medium">
                                                        {toPersianNumber(review.rating)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-6">
                                                {review.content}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <MessageCircle className="h-14 w-14 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground">هنوز نظری ثبت نشده</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Fixed Bottom CTA */}
            <div
                className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 p-4"
                style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
                <div className="flex items-center gap-4" dir="rtl">
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">هزینه هر جلسه</p>
                        <p className="text-xl font-bold text-primary">
                            {formatPrice(coach.pricePerSession || 150000)}
                            <span className="text-xs font-normal text-muted-foreground mr-1">
                                تومان
                            </span>
                        </p>
                    </div>
                    <Button size="lg" className="gap-2 px-8" onClick={() => setShowRequestModal(true)}>
                        <Calendar className="h-5 w-5" />
                        درخواست برنامه
                    </Button>
                </div>
            </div>

            {/* Coaching Request Modal */}
            <CoachingRequestModal
                open={showRequestModal}
                onOpenChange={setShowRequestModal}
                coachId={coach.userId}
                coachName={coach.user?.fullName || "مربی"}
            />

            {/* Avatar Modal - Telegram Style */}
            {showAvatar && coach.user?.avatar && (
                <div
                    className="fixed inset-0 z-[100] bg-black h-[100dvh] overflow-hidden"
                    onClick={() => setShowAvatar(false)}
                >
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 text-white z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={() => setShowAvatar(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <span className="font-medium">{coach.user?.fullName}</span>
                        <div className="w-10" />
                    </div>

                    {/* Image - Upper center */}
                    <div className="absolute top-20 left-0 right-0">
                        <img
                            src={coach.user.avatar}
                            alt={coach.user?.fullName}
                            className="w-full aspect-square object-cover"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function CoachDetailSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-28" dir="rtl">
            <div className="h-14 border-b border-border/50" />
            <div className="px-5 pt-6 pb-4">
                <div className="flex flex-col items-center mb-6">
                    <Skeleton className="h-28 w-28 rounded-full mb-4" />
                    <Skeleton className="h-7 w-32 mb-2" />
                    <Skeleton className="h-6 w-28 rounded-full mb-3" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
            </div>
            <div className="px-5 space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-36 w-full rounded-2xl" />
                <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
        </div>
    );
}
