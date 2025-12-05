import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { translations, formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
    ArrowRight,
    ChevronUp,
    ChevronDown,
    MessageSquare,
    Send,
    Loader2,
    Check,
    MoreHorizontal,
} from "lucide-react";

const categoryColors: Record<string, string> = {
    nutrition: "bg-green-500/10 text-green-500 border-green-500/20",
    training: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    supplements: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    injury: "bg-red-500/10 text-red-500 border-red-500/20",
    general: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

// VoteButtons component with persistent state
function VoteButtons({
    initialVote = 0,
    initialCount = 0,
    onVote,
    disabled = false,
    size = "default"
}: {
    initialVote?: number;
    initialCount?: number;
    onVote?: (value: number) => void;
    disabled?: boolean;
    size?: "default" | "sm";
}) {
    const [localVote, setLocalVote] = useState<1 | -1 | 0>(initialVote as 1 | -1 | 0);
    const [localCount, setLocalCount] = useState(initialCount);

    const handleVote = (value: 1 | -1) => {
        if (disabled) return;

        const newVote = localVote === value ? 0 : value;

        let countChange = 0;
        if (localVote === 0) {
            countChange = value;
        } else if (newVote === 0) {
            countChange = -localVote;
        } else {
            countChange = value * 2;
        }

        setLocalVote(newVote as 1 | -1 | 0);
        setLocalCount(prev => prev + countChange);
        onVote?.(value);
    };

    const buttonSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
    const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    const textSize = size === "sm" ? "text-sm" : "text-lg";

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    buttonSize,
                    "transition-colors hover:bg-transparent hover:text-inherit",
                    localVote === 1 && "text-primary bg-primary/10"
                )}
                onClick={() => handleVote(1)}
                disabled={disabled}
            >
                <ChevronUp className={iconSize} />
            </Button>
            <span className={cn(
                "font-bold",
                textSize,
                localCount > 0 && "text-primary",
                localCount < 0 && "text-destructive"
            )}>
                {toPersianNumber(localCount)}
            </span>
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    buttonSize,
                    "transition-colors hover:bg-transparent hover:text-inherit",
                    localVote === -1 && "text-destructive bg-destructive/10"
                )}
                onClick={() => handleVote(-1)}
                disabled={disabled}
            >
                <ChevronDown className={iconSize} />
            </Button>
        </div>
    );
}

export default function QuestionDetailPage() {
    const params = useParams<{ id: string }>();
    const [, setLocation] = useLocation();
    const [newAnswer, setNewAnswer] = useState("");
    const { toast } = useToast();

    const { data: currentUser } = useQuery<any>({
        queryKey: ["/api/auth/me"],
    });

    const { data: question, isLoading } = useQuery<any>({
        queryKey: ["/api/questions", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/questions/${params.id}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Question not found");
            return res.json();
        },
        enabled: !!params.id,
    });

    const { data: answers, isLoading: answersLoading } = useQuery<any[]>({
        queryKey: ["/api/questions", params.id, "answers"],
        queryFn: async () => {
            const res = await fetch(`/api/questions/${params.id}/answers`, {
                credentials: "include",
            });
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!params.id,
    });

    const submitAnswerMutation = useMutation({
        mutationFn: async (content: string) => {
            return apiRequest("POST", `/api/questions/${params.id}/answers`, { content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/questions", params.id, "answers"] });
            queryClient.invalidateQueries({ queryKey: ["/api/questions", params.id] });
            setNewAnswer("");
            toast({
                title: "پاسخ ثبت شد",
                description: "پاسخ شما با موفقیت ثبت شد",
            });
        },
        onError: () => {
            toast({
                title: "خطا",
                description: "مشکلی در ثبت پاسخ پیش آمد",
                variant: "destructive",
            });
        },
    });

    const voteQuestionMutation = useMutation({
        mutationFn: async (value: number) => {
            return apiRequest("POST", `/api/questions/${params.id}/vote`, { value });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/questions", params.id] });
        },
    });

    const voteAnswerMutation = useMutation({
        mutationFn: async ({ answerId, value }: { answerId: string; value: number }) => {
            return apiRequest("POST", `/api/answers/${answerId}/vote`, { value });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/questions", params.id, "answers"] });
        },
    });

    const handleSubmitAnswer = () => {
        if (newAnswer.trim()) {
            submitAnswerMutation.mutate(newAnswer);
        }
    };

    if (isLoading) {
        return <QuestionDetailSkeleton />;
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">سوال یافت نشد</p>
                    <Button onClick={() => setLocation("/education")}>
                        بازگشت به انجمن
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-6" dir="rtl">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
                <div className="flex items-center gap-4 px-4 h-14">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/education")}
                        className="rounded-xl"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <h1 className="font-bold text-lg truncate">جزئیات سوال</h1>
                </div>
            </div>

            <div className="container max-w-3xl px-4 py-6">
                {/* Question */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-3">
                            {question.category && (
                                <Badge
                                    variant="outline"
                                    className={cn("text-xs", categoryColors[question.category] || categoryColors.general)}
                                >
                                    {translations.education.categories[question.category as keyof typeof translations.education.categories] || question.category}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-xl font-bold leading-relaxed">{question.title}</h1>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-7 whitespace-pre-wrap mb-6">
                            {question.content}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={question.user?.avatar || undefined} />
                                    <AvatarFallback className="text-sm">
                                        {question.user?.fullName?.charAt(0) || "؟"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{question.user?.fullName || "کاربر"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatRelativeTime(question.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <VoteButtons
                                    initialVote={question.userVote || 0}
                                    initialCount={question.voteCount || 0}
                                    onVote={(value) => voteQuestionMutation.mutate(value)}
                                    disabled={!currentUser}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Answers Section */}
                <div className="mb-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        {toPersianNumber(answers?.length || 0)} پاسخ
                    </h2>

                    {answersLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <Card key={i}>
                                    <CardContent className="p-4">
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-3/4 mb-4" />
                                        <Skeleton className="h-8 w-32" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : answers && answers.length > 0 ? (
                        <div className="space-y-4">
                            {answers.map((answer: any) => (
                                <Card
                                    key={answer.id}
                                    className={cn(
                                        "transition-all",
                                        answer.isBestAnswer && "border-primary/50 bg-primary/5"
                                    )}
                                >
                                    <CardContent className="p-4">
                                        {answer.isBestAnswer && (
                                            <Badge className="mb-3 gap-1 bg-primary">
                                                <Check className="h-3 w-3" />
                                                بهترین پاسخ
                                            </Badge>
                                        )}
                                        <p className="text-sm leading-7 whitespace-pre-wrap mb-4">
                                            {answer.content}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={answer.user?.avatar || undefined} />
                                                    <AvatarFallback className="text-xs">
                                                        {answer.user?.fullName?.charAt(0) || "؟"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-muted-foreground">
                                                    {answer.user?.fullName || "کاربر"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatRelativeTime(answer.createdAt)}
                                                </span>
                                            </div>
                                            <VoteButtons
                                                initialVote={answer.userVote || 0}
                                                initialCount={answer.voteCount || 0}
                                                onVote={(value) => voteAnswerMutation.mutate({ answerId: answer.id, value })}
                                                disabled={!currentUser}
                                                size="sm"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-8">
                            <CardContent>
                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">هنوز پاسخی ثبت نشده</p>
                                <p className="text-sm text-muted-foreground">اولین نفری باشید که پاسخ می‌دهید!</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Answer Form */}
                {currentUser && (
                    <Card>
                        <CardHeader className="pb-2">
                            <h3 className="font-bold">پاسخ شما</h3>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="پاسخ خود را بنویسید..."
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                className="min-h-[120px] resize-none mb-4"
                            />
                            <Button
                                onClick={handleSubmitAnswer}
                                disabled={!newAnswer.trim() || submitAnswerMutation.isPending}
                                className="gap-2"
                            >
                                {submitAnswerMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 rtl-flip" />
                                )}
                                ثبت پاسخ
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function QuestionDetailSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-6" dir="rtl">
            <div className="h-14 border-b border-border/50" />
            <div className="container max-w-3xl px-4 py-6">
                <Card className="mb-6">
                    <CardHeader>
                        <Skeleton className="h-6 w-20 mb-3" />
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3 mb-6" />
                        <div className="flex items-center gap-3 pt-4 border-t">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
