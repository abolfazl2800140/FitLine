import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatRelativeTime } from "@/lib/persian";
import {
    ArrowRight,
    Check,
    X,
    Clock,
    Dumbbell,
    Apple,
    Sparkles,
    MessageCircle,
    Loader2,
    Inbox,
} from "lucide-react";

const typeLabels: Record<string, { label: string; icon: any }> = {
    workout: { label: "برنامه تمرینی", icon: Dumbbell },
    nutrition: { label: "برنامه تغذیه", icon: Apple },
    both: { label: "تمرین + تغذیه", icon: Sparkles },
    consultation: { label: "مشاوره", icon: MessageCircle },
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    pending: { label: "در انتظار", variant: "secondary" },
    accepted: { label: "قبول شده", variant: "default" },
    rejected: { label: "رد شده", variant: "destructive" },
};

export default function CoachRequestsPage() {
    const [, setLocation] = useLocation();
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery<any[]>({
        queryKey: ["/api/coach/requests"],
    });

    const acceptMutation = useMutation({
        mutationFn: async (requestId: string) => {
            return apiRequest("POST", `/api/coaching-requests/${requestId}/accept`);
        },
        onSuccess: (data) => {
            toast({
                title: "درخواست قبول شد",
                description: "یک مکالمه جدید با شاگرد ایجاد شد",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/coach/requests"] });
            queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
            if (data.conversationId) {
                setLocation("/messages");
            }
        },
        onError: (error: Error) => {
            toast({
                title: "خطا",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
            return apiRequest("POST", `/api/coaching-requests/${requestId}/reject`, { reason });
        },
        onSuccess: () => {
            toast({
                title: "درخواست رد شد",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/coach/requests"] });
            setShowRejectDialog(false);
            setRejectReason("");
            setSelectedRequest(null);
        },
        onError: (error: Error) => {
            toast({
                title: "خطا",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const pendingRequests = requests?.filter((r) => r.status === "pending") || [];
    const processedRequests = requests?.filter((r) => r.status !== "pending") || [];

    const handleReject = () => {
        if (selectedRequest) {
            rejectMutation.mutate({ requestId: selectedRequest.id, reason: rejectReason });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20" dir="rtl">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
                <div className="flex items-center gap-3 px-4 h-14">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/coach")}
                        className="rounded-full text-primary-foreground hover:bg-white/20"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold text-primary-foreground">درخواست‌های برنامه</h1>
                </div>
            </div>
            <div className="h-14" />

            <div className="container max-w-2xl px-4 py-6">
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 mb-6">
                        <TabsTrigger value="pending" className="gap-2">
                            <Clock className="h-4 w-4" />
                            در انتظار
                            {pendingRequests.length > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-[20px] p-0 flex items-center justify-center">
                                    {pendingRequests.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="processed">پردازش شده</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
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
                        ) : pendingRequests.length > 0 ? (
                            pendingRequests.map((request) => {
                                const TypeIcon = typeLabels[request.type]?.icon || Dumbbell;
                                return (
                                    <Card key={request.id} className="overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={request.user?.avatar} />
                                                    <AvatarFallback>{request.user?.fullName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-semibold">{request.user?.fullName}</h3>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatRelativeTime(request.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="gap-1">
                                                            <TypeIcon className="h-3 w-3" />
                                                            {typeLabels[request.type]?.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm font-medium mb-1">هدف: {request.goal}</p>
                                                    {request.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {request.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <Button
                                                    className="flex-1 gap-2"
                                                    onClick={() => acceptMutation.mutate(request.id)}
                                                    disabled={acceptMutation.isPending}
                                                >
                                                    {acceptMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                    قبول
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 gap-2"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowRejectDialog(true);
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                    رد
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Inbox className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">درخواستی وجود ندارد</h3>
                                    <p className="text-muted-foreground">
                                        در حال حاضر درخواست جدیدی برای بررسی ندارید
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="processed" className="space-y-4">
                        {processedRequests.length > 0 ? (
                            processedRequests.map((request) => {
                                const TypeIcon = typeLabels[request.type]?.icon || Dumbbell;
                                const status = statusLabels[request.status];
                                return (
                                    <Card key={request.id} className="overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={request.user?.avatar} />
                                                    <AvatarFallback>{request.user?.fullName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-semibold">{request.user?.fullName}</h3>
                                                        <Badge variant={status?.variant}>{status?.label}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="gap-1">
                                                            <TypeIcon className="h-3 w-3" />
                                                            {typeLabels[request.type]?.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{request.goal}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Inbox className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">هنوز درخواستی پردازش نشده</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent dir="rtl">
                    <DialogHeader>
                        <DialogTitle>رد درخواست</DialogTitle>
                        <DialogDescription>
                            می‌توانید دلیل رد درخواست را برای {selectedRequest?.user?.fullName} بنویسید (اختیاری)
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="دلیل رد درخواست..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            انصراف
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={rejectMutation.isPending}
                        >
                            {rejectMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            ) : null}
                            رد درخواست
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
