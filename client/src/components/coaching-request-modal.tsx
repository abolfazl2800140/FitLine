import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Dumbbell, Apple, Sparkles, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";

interface CoachingRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coachId: string;
    coachName: string;
}

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

export function CoachingRequestModal({
    open,
    onOpenChange,
    coachId,
    coachName,
}: CoachingRequestModalProps) {
    const [type, setType] = useState("workout");
    const [goal, setGoal] = useState("");
    const [description, setDescription] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Get monthly status
    const { data: monthlyStatus } = useQuery<MonthlyStatus>({
        queryKey: ["/api/coaching-requests/monthly-status"],
        enabled: open,
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
            return "هر دو سهمیه ماهانه استفاده شده";
        }
        if (typeConfig.requiresWorkout && monthlyStatus.workout.used) {
            return "سهمیه برنامه تمرینی این ماه استفاده شده";
        }
        if (typeConfig.requiresNutrition && monthlyStatus.nutrition.used) {
            return "سهمیه برنامه تغذیه این ماه استفاده شده";
        }
        return "";
    };

    const mutation = useMutation({
        mutationFn: async () => {
            return apiRequest("POST", "/api/coaching-requests", {
                coachId,
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
            onOpenChange(false);
            resetForm();
        },
        onError: (error: Error) => {
            toast({
                title: "خطا",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setType("workout");
        setGoal("");
        setDescription("");
    };

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>درخواست برنامه از {coachName}</DialogTitle>
                    <DialogDescription>
                        نوع برنامه و هدف خود را مشخص کنید تا مربی بتواند بهتر به شما کمک کند.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Monthly Status Alert */}
                    {monthlyStatus && (monthlyStatus.workout.used || monthlyStatus.nutrition.used) && (
                        <Alert className="border-amber-500/50 bg-amber-500/10">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <AlertDescription className="text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">وضعیت سهمیه ماهانه شما:</span>
                                    <div className="flex items-center gap-2">
                                        {monthlyStatus.workout.used ? (
                                            <span className="flex items-center gap-1 text-xs">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                برنامه تمرینی دریافت شده
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Dumbbell className="h-3 w-3" />
                                                ۱ برنامه تمرینی باقی‌مانده
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {monthlyStatus.nutrition.used ? (
                                            <span className="flex items-center gap-1 text-xs">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                برنامه تغذیه دریافت شده
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Apple className="h-3 w-3" />
                                                ۱ برنامه تغذیه باقی‌مانده
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-3">
                        <Label>نوع درخواست</Label>
                        <RadioGroup value={type} onValueChange={(val) => !isTypeDisabled(val) && setType(val)} className="grid grid-cols-2 gap-3">
                            {requestTypes.map((item) => {
                                const Icon = item.icon;
                                const disabled = isTypeDisabled(item.value);
                                const disabledReason = getDisabledReason(item.value);
                                return (
                                    <label
                                        key={item.value}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all relative ${disabled
                                            ? "border-border bg-muted/50 cursor-not-allowed opacity-60"
                                            : type === item.value
                                                ? "border-primary bg-primary/5 cursor-pointer"
                                                : "border-border hover:border-primary/50 cursor-pointer"
                                            }`}
                                    >
                                        <RadioGroupItem value={item.value} className="sr-only" disabled={disabled} />
                                        <Icon className={`h-6 w-6 ${disabled ? "text-muted-foreground" : type === item.value ? "text-primary" : "text-muted-foreground"}`} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                        {disabled ? (
                                            <span className="text-xs text-amber-600 text-center">{disabledReason}</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">{item.description}</span>
                                        )}
                                    </label>
                                );
                            })}
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="goal">هدف شما *</Label>
                        <Textarea
                            id="goal"
                            placeholder="مثال: می‌خواهم در ۳ ماه ۱۰ کیلو کم کنم..."
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="min-h-[80px] resize-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">توضیحات بیشتر (اختیاری)</Label>
                        <Textarea
                            id="description"
                            placeholder="سابقه ورزشی، محدودیت‌ها، ترجیحات..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[80px] resize-none"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={mutation.isPending || isTypeDisabled(type)}>
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                در حال ارسال...
                            </>
                        ) : isTypeDisabled(type) ? (
                            "سهمیه این نوع برنامه تمام شده"
                        ) : (
                            "ارسال درخواست"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
