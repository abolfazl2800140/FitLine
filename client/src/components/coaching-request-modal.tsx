import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Dumbbell, Apple, Sparkles, MessageCircle } from "lucide-react";

interface CoachingRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coachId: string;
    coachName: string;
}

const requestTypes = [
    { value: "workout", label: "برنامه تمرینی", icon: Dumbbell, description: "برنامه تمرین بدنسازی" },
    { value: "nutrition", label: "برنامه تغذیه", icon: Apple, description: "رژیم غذایی و تغذیه" },
    { value: "both", label: "تمرین + تغذیه", icon: Sparkles, description: "برنامه کامل" },
    { value: "consultation", label: "مشاوره", icon: MessageCircle, description: "جلسه مشاوره" },
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
                    <div className="space-y-3">
                        <Label>نوع درخواست</Label>
                        <RadioGroup value={type} onValueChange={setType} className="grid grid-cols-2 gap-3">
                            {requestTypes.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <label
                                        key={item.value}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${type === item.value
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <RadioGroupItem value={item.value} className="sr-only" />
                                        <Icon className={`h-6 w-6 ${type === item.value ? "text-primary" : "text-muted-foreground"}`} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                        <span className="text-xs text-muted-foreground">{item.description}</span>
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

                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                در حال ارسال...
                            </>
                        ) : (
                            "ارسال درخواست"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
