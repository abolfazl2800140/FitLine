import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/persian";
import {
    ArrowRight,
    Clock,
    Check,
    X,
    Dumbbell,
    Apple,
    Sparkles,
    MessageCircle,
    Inbox,
} from "lucide-react";

const typeLabels: Record<string, { label: string; icon: any }> = {
    workout: { label: "برنامه تمرینی", icon: Dumbbell },
    nutrition: { label: "برنامه تغذیه", icon: Apple },
    both: { label: "تمرین + تغذیه", icon: Sparkles },
    consultation: { label: "مشاوره", icon: MessageCircle },
};

const statusConfig: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive"; color: string }> = {
    pending: { label: "در انتظار بررسی", icon: Clock, variant: "secondary", color: "text-yellow-500" },
    accepted: { label: "قبول شده", icon: Check, variant: "default", color: "text-green-500" },
    rejected: { label: "رد شده", icon: X, variant: "destructive", color: "text-red-500" },
};

export default function MyRequestsPage() {
    const [, setLocation] = useLocation();

    const { data: requests, isLoading } = useQuery<any[]>({
        queryKey: ["/api/coaching-requests/my"],
    });

    return (
        <div className="min-h-screen bg-background pb-20" dir="rtl">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
                <div className="flex items-center gap-3 px-4 h-14">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/profile")}
                        className="rounded-full text-primary-foreground hover:bg-white/20"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold text-primary-foreground">درخواست‌های من</h1>
                </div>
            </div>
            <div className="h-14" />

            <div className="container max-w-2xl px-4 py-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
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
                ) : requests && requests.length > 0 ? (
                    <div className="space-y-4">
                        {requests.map((request) => {
                            const TypeIcon = typeLabels[request.type]?.icon || Dumbbell;
                            const status = statusConfig[request.status];
                            const StatusIcon = status?.icon || Clock;

                            return (
                                <Card key={request.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={request.coach?.avatar} />
                                                <AvatarFallback>{request.coach?.fullName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold">{request.coach?.fullName}</h3>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatRelativeTime(request.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="gap-1">
                                                        <TypeIcon className="h-3 w-3" />
                                                        {typeLabels[request.type]?.label}
                                                    </Badge>
                                                    <Badge variant={status?.variant} className="gap-1">
                                                        <StatusIcon className={`h-3 w-3 ${status?.color}`} />
                                                        {status?.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    <span className="font-medium">هدف:</span> {request.goal}
                                                </p>
                                                {request.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {request.description}
                                                    </p>
                                                )}
                                                {request.status === "rejected" && request.rejectionReason && (
                                                    <div className="mt-2 p-2 bg-destructive/10 rounded-lg">
                                                        <p className="text-sm text-destructive">
                                                            <span className="font-medium">دلیل رد:</span> {request.rejectionReason}
                                                        </p>
                                                    </div>
                                                )}
                                                {request.status === "accepted" && request.conversationId && (
                                                    <Button
                                                        size="sm"
                                                        className="mt-3 gap-2"
                                                        onClick={() => setLocation("/messages")}
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                        رفتن به چت
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Inbox className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">درخواستی ندارید</h3>
                            <p className="text-muted-foreground mb-4">
                                برای دریافت برنامه از مربیان، به صفحه مربیان بروید
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
