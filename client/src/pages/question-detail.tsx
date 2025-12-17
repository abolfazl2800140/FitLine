import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { translations, formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ReportDialog } from "@/components/ui/report-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Send,
  Loader2,
  Check,
  MoreHorizontal,
  Flag,
} from "lucide-react";

const categoryColors: Record<string, string> = {
  nutrition: "bg-green-500/10 text-green-500 border-green-500/20",
  training: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  supplements: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  injury: "bg-red-500/10 text-red-500 border-red-500/20",
  general: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

function VoteButtons({
  initialVote = 0,
  initialCount = 0,
  onVote,
  disabled = false,
  size = "default",
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
    setLocalCount((prev) => prev + countChange);
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
      <span
        className={cn(
          "font-bold",
          textSize,
          localCount > 0 && "text-primary",
          localCount < 0 && "text-destructive"
        )}
      >
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
  const [isComposing, setIsComposing] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
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
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setNewAnswer("");
      setIsComposing(false);
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

  const markBestAnswerMutation = useMutation({
    mutationFn: async (answerId: string) => {
      return apiRequest("POST", `/api/answers/${answerId}/best`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions", params.id, "answers"] });
      toast({
        title: "پاسخ برگزیده شد",
        description: "این پاسخ به عنوان بهترین پاسخ انتخاب شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "فقط صاحب سوال می‌تواند پاسخ برگزیده را انتخاب کند",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
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
          <Button onClick={() => setLocation("/education")}>بازگشت به انجمن</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <span className="mr-4 font-semibold">سوال</span>
        </div>
      </div>
      <div className="h-14" />

      {/* Main Question */}
      <div className="border-b">
        <div className="p-4">
          {/* Category Badge */}
          {question.category && (
            <Badge
              variant="outline"
              className={cn("text-xs mb-3", categoryColors[question.category] || categoryColors.general)}
            >
              {translations.education.categories[question.category as keyof typeof translations.education.categories] ||
                question.category}
            </Badge>
          )}

          {/* Question Header */}
          <div className="flex items-start gap-3">
            <div className="cursor-pointer" onClick={() => setLocation(`/user/${question.userId}`)}>
              <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                <AvatarImage src={question.user?.avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                  {question.user?.fullName?.charAt(0) || "؟"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="cursor-pointer" onClick={() => setLocation(`/user/${question.userId}`)}>
                <h4 className="font-bold hover:underline">{question.user?.fullName || "کاربر"}</h4>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-right">
                <DropdownMenuItem className="justify-end gap-2" onClick={() => setReportOpen(true)}>
                  <Flag className="h-4 w-4" />
                  گزارش
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Question Content */}
          <div className="mt-3">
            <h1 className="text-lg font-bold leading-relaxed mb-2">{question.title}</h1>
            <p className="text-base leading-relaxed whitespace-pre-wrap">{question.content}</p>
          </div>

          {/* Question Time */}
          <div className="mt-4 text-sm text-muted-foreground">{formatRelativeTime(question.createdAt)}</div>

          {/* Question Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{toPersianNumber(answers?.length || 0)} پاسخ</span>
            </div>
            <VoteButtons
              initialVote={question.userVote || 0}
              initialCount={question.voteCount || 0}
              onVote={(value) => voteQuestionMutation.mutate(value)}
              disabled={!currentUser}
            />
          </div>
        </div>
      </div>

      {/* Report Dialog for Question */}
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} itemId={params.id!} itemType="question" />

      {/* Compose Modal */}
      {isComposing && (
        <div className="fixed inset-0 z-[100] bg-background">
          <div className="flex items-center justify-between h-14 px-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsComposing(false);
                setNewAnswer("");
              }}
            >
              انصراف
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newAnswer.trim() || submitAnswerMutation.isPending}
              className="rounded-full px-5"
            >
              {submitAnswerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "ارسال"}
            </Button>
          </div>

          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.avatar || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {currentUser?.fullName?.charAt(0) || "؟"}
                  </AvatarFallback>
                </Avatar>
                <div className="w-0.5 flex-1 bg-border/30 mt-2" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-2">{currentUser?.fullName || "کاربر"}</p>
                <Textarea
                  placeholder={`پاسخ به ${question?.user?.fullName || "سوال"}...`}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="min-h-[120px] resize-none text-base border-0 p-0 focus-visible:ring-0"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Answers List */}
      <div className="pb-20">
        {answersLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : answers && answers.length > 0 ? (
          <div>
            {answers.map((answer: any) => (
              <AnswerItem
                key={answer.id}
                answer={answer}
                currentUserId={currentUser?.id}
                questionUserId={question.userId}
                onVote={(value) => voteAnswerMutation.mutate({ answerId: answer.id, value })}
                onMarkBest={() => markBestAnswerMutation.mutate(answer.id)}
                onUserClick={(userId) => setLocation(`/user/${userId}`)}
                disabled={!currentUser}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>هنوز پاسخی ثبت نشده</p>
            <p className="text-sm mt-1">اولین نفری باشید که پاسخ می‌دهید</p>
          </div>
        )}
      </div>

      {/* Bottom Answer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser?.avatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {currentUser?.fullName?.charAt(0) || "؟"}
            </AvatarFallback>
          </Avatar>
          <div
            className="flex-1 bg-muted/50 rounded-full px-4 py-2.5 cursor-pointer"
            onClick={() => currentUser && setIsComposing(true)}
          >
            <span className="text-sm text-muted-foreground">
              {currentUser ? "پاسخ خود را بنویسید..." : "برای پاسخ وارد شوید"}
            </span>
          </div>
          <Button
            size="icon"
            className="h-10 w-10 rounded-full"
            disabled={!currentUser}
            onClick={() => currentUser && setIsComposing(true)}
          >
            <Send className="h-5 w-5 rtl-flip" />
          </Button>
        </div>
      </div>
    </div>
  );
}


interface AnswerItemProps {
  answer: any;
  currentUserId?: string;
  questionUserId: string;
  onVote: (value: number) => void;
  onMarkBest: () => void;
  onUserClick: (userId: string) => void;
  disabled: boolean;
}

function AnswerItem({
  answer,
  currentUserId,
  questionUserId,
  onVote,
  onMarkBest,
  onUserClick,
  disabled,
}: AnswerItemProps) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative border-b",
        answer.isBestAnswer && "border-r-4 border-r-primary bg-primary/5"
      )}
    >
      <div className="p-4">
        <div className="flex gap-3">
          <div className="relative flex flex-col items-center">
            <div className="cursor-pointer" onClick={() => onUserClick(answer.userId)}>
              <Avatar
                className={cn(
                  "h-10 w-10 ring-1",
                  answer.isBestAnswer ? "ring-primary" : "ring-border/50"
                )}
              >
                <AvatarImage src={answer.user?.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {answer.user?.fullName?.charAt(0) || "؟"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {answer.isBestAnswer && (
                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                )}
                <span
                  className={cn(
                    "font-semibold text-sm cursor-pointer hover:underline",
                    answer.isBestAnswer && "text-primary"
                  )}
                  onClick={() => onUserClick(answer.userId)}
                >
                  {answer.user?.fullName || "کاربر"}
                </span>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(answer.createdAt)}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-right">
                  <DropdownMenuItem className="justify-end gap-2" onClick={() => setReportOpen(true)}>
                    <Flag className="h-4 w-4" />
                    گزارش
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm leading-relaxed mt-1 whitespace-pre-wrap">{answer.content}</p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {currentUserId === questionUserId && !answer.isBestAnswer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 text-muted-foreground hover:text-primary h-7 px-2"
                    onClick={onMarkBest}
                  >
                    <Check className="h-3 w-3" />
                    برگزیده
                  </Button>
                )}
              </div>
              <VoteButtons
                initialVote={answer.userVote || 0}
                initialCount={answer.voteCount || 0}
                onVote={onVote}
                disabled={disabled}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} itemId={answer.id} itemType="answer" />
    </div>
  );
}

function QuestionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center h-14 px-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-20 mr-4" />
        </div>
      </div>
      <div className="h-14" />
      <div className="border-b p-4">
        <Skeleton className="h-6 w-20 mb-3" />
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-6 w-full mt-3" />
        <Skeleton className="h-4 w-3/4 mt-2" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </div>
    </div>
  );
}
