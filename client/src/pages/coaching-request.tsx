import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Loader2,
  Dumbbell,
  Apple,
  Sparkles,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";

interface MonthlyStatus {
  workout: { used: boolean; count: number; limit: number };
  nutrition: { used: boolean; count: number; limit: number };
}

const requestTypes = [
  { value: "workout", label: "برنامه تمرینی", icon: Dumbbell, description: "برنامه تمرین بدنسازی", requiresWorkout: true, requiresNutrition: false },
  { value: "nutrition", label: "برنامه تغذیه", icon: Apple, description: "رژیم غذایی و تغذیه", requiresWorkout: false, requiresNutrition: true },
  { value: "both", label: "تمرین + تغذیه", icon: Sparkles, description: "برنامه کامل", requiresWorkout: true, requiresNutrition: true },
  { value: "consultation", label: "مشاوره", icon: MessageCircle, description: "جلسه مشاوره", requiresWorkout: false, requiresNutrition: false },
];

export default function CoachingRequestPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [type, setType] = useState("workout");
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get coach info
  const { data: coach, isLoading: coachLoading } = useQuery<any>({
    queryKey: ["/api/coaches", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/coaches/${params.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Coach not found");
      return res.json();
    },
    enabled: !!params.id,
  });

  // Get monthly status
  const { data: monthlyStatus } = useQuery<MonthlyStatus>({
    queryKey: ["/api/coaching-requests/monthly-status"],
  });


  // Check if a type is disabled based on monthly limits
  const isTypeDisabled = (typeValue: string) => {
    if (!monthlyStatus) return false;
    const typeConfig = requestTypes.find(t => t.value === typeValue);
    if (!typeConfig) return false;
    if (typeConfig.requiresWorkout && monthlyStatus.workout.used) return true;
    if (typeConfig.requiresNutrition && monthlyStatus.nutrition.used) return true;
    return false;
  };

  // Get disabled reason
  const getDisabledReason = (typeValue: string) => {
    if (!monthlyStatus) return "";
    const typeConfig = requestTypes.find(t => t.value === typeValue);
    if (!typeConfig) return "";
    if (typeConfig.requiresWorkout && monthlyStatus.workout.used && typeConfig.requiresNutrition && monthlyStatus.nutrition.used) {
      return "هر دو سهمیه استفاده شده";
    }
    if (typeConfig.requiresWorkout && monthlyStatus.workout.used) {
      return "سهمیه تمرینی تمام شده";
    }
    if (typeConfig.requiresNutrition && monthlyStatus.nutrition.used) {
      return "سهمیه تغذیه تمام شده";
    }
    return "";
  };

  const mutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/coaching-requests", {
        coachId: coach?.userId,
        type,
        goal,
        description,
      });
    },
    onSuccess: () => {
      toast({
        title: "درخواست ارسال شد",
        description: "درخواست شما با موفقیت ارسال شد. منتظر پاسخ مربی باشید.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coaching-requests/my"] });
      setLocation("/my-requests");
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً هدف خود را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate();
  };

  if (coachLoading) {
    return <CoachingRequestSkeleton />;
  }

  if (!coach) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">مربی یافت نشد</p>
          <Button onClick={() => setLocation("/coaches")}>بازگشت</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(`/coaches/${params.id}`)}
            className="rounded-full"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">درخواست برنامه</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Coach Info Card */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage src={coach.user?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {coach.user?.fullName?.charAt(0) || "م"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold">{coach.user?.fullName || "مربی"}</h2>
                  {coach.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{coach.specialty || "بدنسازی"}</p>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Monthly Status Alert */}
        {monthlyStatus && (monthlyStatus.workout.used || monthlyStatus.nutrition.used) && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              <div className="flex flex-col gap-1">
                <span className="font-medium">وضعیت سهمیه ماهانه:</span>
                <div className="flex items-center gap-4 mt-1">
                  {monthlyStatus.workout.used ? (
                    <span className="flex items-center gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      تمرینی دریافت شده
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Dumbbell className="h-3 w-3" />
                      ۱ تمرینی باقی‌مانده
                    </span>
                  )}
                  {monthlyStatus.nutrition.used ? (
                    <span className="flex items-center gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      تغذیه دریافت شده
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Apple className="h-3 w-3" />
                      ۱ تغذیه باقی‌مانده
                    </span>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Request Type */}
          <div className="space-y-3">
            <Label className="text-base font-bold">نوع درخواست</Label>
            <RadioGroup value={type} onValueChange={(val) => !isTypeDisabled(val) && setType(val)} className="grid grid-cols-2 gap-3">
              {requestTypes.map((item) => {
                const Icon = item.icon;
                const disabled = isTypeDisabled(item.value);
                const disabledReason = getDisabledReason(item.value);
                return (
                  <label
                    key={item.value}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      disabled
                        ? "border-border bg-muted/50 cursor-not-allowed opacity-60"
                        : type === item.value
                        ? "border-primary bg-primary/5 cursor-pointer"
                        : "border-border hover:border-primary/50 cursor-pointer"
                    }`}
                  >
                    <RadioGroupItem value={item.value} className="sr-only" disabled={disabled} />
                    <Icon className={`h-7 w-7 ${disabled ? "text-muted-foreground" : type === item.value ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-bold text-sm">{item.label}</span>
                    {disabled ? (
                      <span className="text-[10px] text-amber-600 text-center">{disabledReason}</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">{item.description}</span>
                    )}
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal" className="text-base font-bold">هدف شما *</Label>
            <Textarea
              id="goal"
              placeholder="مثال: می‌خواهم در ۳ ماه ۱۰ کیلو کم کنم..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="min-h-[100px] resize-none text-base"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-bold">توضیحات بیشتر (اختیاری)</Label>
            <Textarea
              id="description"
              placeholder="سابقه ورزشی، محدودیت‌ها، ترجیحات..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none text-base"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full text-base"
            disabled={mutation.isPending || isTypeDisabled(type)}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin ml-2" />
                در حال ارسال...
              </>
            ) : isTypeDisabled(type) ? (
              "سهمیه این نوع برنامه تمام شده"
            ) : (
              "ارسال درخواست"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function CoachingRequestSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-8" dir="rtl">
      <div className="sticky top-0 z-50 bg-background border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      <div className="px-4 py-4 space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}
