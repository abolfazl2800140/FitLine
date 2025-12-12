import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import {
    Bell, BellOff, Check, Clock, Flame, Apple,
    Beef, Wheat, Droplets, ChevronLeft, Settings,
    Calendar, TrendingUp, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MealItem {
    id: string;
    name: string;
    quantity: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
}

interface Meal {
    id: string;
    mealType: string;
    title: string;
    description?: string;
    scheduledTime: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    items: MealItem[];
}

interface NutritionPlan {
    id: string;
    title: string;
    description?: string;
    dailyCalories?: number;
    dailyProtein?: number;
    dailyCarbs?: number;
    dailyFat?: number;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    coach: {
        id: string;
        fullName: string;
        avatar?: string;
    };
    meals: Meal[];
}

const mealTypeLabels: Record<string, string> = {
    breakfast: "صبحانه",
    morning_snack: "میان‌وعده صبح",
    lunch: "ناهار",
    afternoon_snack: "میان‌وعده عصر",
    dinner: "شام",
    evening_snack: "میان‌وعده شب",
};

const mealTypeIcons: Record<string, string> = {
    breakfast: "🌅",
    morning_snack: "🍎",
    lunch: "🍽️",
    afternoon_snack: "🥤",
    dinner: "🌙",
    evening_snack: "🥛",
};

export default function NutritionPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { isSupported, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotifications();

    // Fetch active nutrition plan
    const { data: plan, isLoading } = useQuery<NutritionPlan | null>({
        queryKey: ["/api/nutrition-plans/active"],
    });

    // Fetch today's meal logs
    const { data: todayLogs = [] } = useQuery<{ mealId: string }[]>({
        queryKey: ["/api/meal-logs/today"],
    });

    // Fetch reminders
    const { data: reminders = [] } = useQuery<any[]>({
        queryKey: ["/api/meal-reminders"],
    });

    // Log meal completion
    const logMealMutation = useMutation({
        mutationFn: async ({ mealId, rating }: { mealId: string; rating?: number }) => {
            const res = await fetch(`/api/meals/${mealId}/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating }),
                credentials: "include",
            });
            if (!res.ok) throw new Error("خطا در ثبت");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/meal-logs/today"] });
            toast({ title: "ثبت شد! ✓", description: "آفرین! به خوردن ادامه بده 💪" });
        },
    });

    // Toggle reminder
    const toggleReminderMutation = useMutation({
        mutationFn: async ({ reminderId, isEnabled }: { reminderId: string; isEnabled: boolean }) => {
            const res = await fetch(`/api/meal-reminders/${reminderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isEnabled }),
                credentials: "include",
            });
            if (!res.ok) throw new Error("خطا");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/meal-reminders"] });
        },
    });

    const completedMealIds = new Set(todayLogs.map(log => log.mealId));

    // Calculate today's progress
    const calculateProgress = () => {
        if (!plan?.meals) return { calories: 0, protein: 0, carbs: 0, fat: 0, percentage: 0 };

        let consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        plan.meals.forEach(meal => {
            if (completedMealIds.has(meal.id)) {
                consumed.calories += meal.calories || 0;
                consumed.protein += meal.protein || 0;
                consumed.carbs += meal.carbs || 0;
                consumed.fat += meal.fat || 0;
            }
        });

        const percentage = plan.dailyCalories
            ? Math.round((consumed.calories / plan.dailyCalories) * 100)
            : 0;

        return { ...consumed, percentage };
    };

    const progress = calculateProgress();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-background p-4">
                <div className="max-w-lg mx-auto text-center py-20">
                    <Apple className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-bold mb-2">برنامه تغذیه‌ای ندارید</h2>
                    <p className="text-muted-foreground mb-6">
                        برای دریافت برنامه تغذیه، از یک مربی درخواست دهید
                    </p>
                    <Button onClick={() => window.location.href = "/coaches"}>
                        مشاهده مربیان
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-b-3xl">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold">برنامه تغذیه</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => isSubscribed ? unsubscribe() : subscribe()}
                        disabled={pushLoading || !isSupported}
                    >
                        {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </Button>
                </div>

                <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <Link href={`/user/${plan.coach.id}`}>
                        <div className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity">
                            <img
                                src={plan.coach.avatar || "/placeholder-progress.svg"}
                                alt={plan.coach.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <p className="text-sm opacity-80">مربی شما</p>
                                <p className="font-semibold">{plan.coach.fullName}</p>
                            </div>
                        </div>
                    </Link>
                    <h2 className="font-bold text-lg">{plan.title}</h2>
                    {plan.description && (
                        <p className="text-sm opacity-80 mt-1">{plan.description}</p>
                    )}
                </div>
            </div>

            {/* Daily Progress */}
            <div className="p-4 -mt-4">
                <Card className="shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            پیشرفت امروز
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>کالری مصرفی</span>
                                <span className="font-bold">{progress.calories} / {plan.dailyCalories || 0}</span>
                            </div>
                            <Progress value={progress.percentage} className="h-3" />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-2 bg-red-50 rounded-xl">
                                <Beef className="w-5 h-5 mx-auto text-red-500 mb-1" />
                                <p className="text-xs text-muted-foreground">پروتئین</p>
                                <p className="font-bold text-sm">{progress.protein}g</p>
                            </div>
                            <div className="text-center p-2 bg-amber-50 rounded-xl">
                                <Wheat className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                                <p className="text-xs text-muted-foreground">کربوهیدرات</p>
                                <p className="font-bold text-sm">{progress.carbs}g</p>
                            </div>
                            <div className="text-center p-2 bg-blue-50 rounded-xl">
                                <Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                                <p className="text-xs text-muted-foreground">چربی</p>
                                <p className="font-bold text-sm">{progress.fat}g</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div >

            {/* Meals */}
            < div className="p-4" >
                <Tabs defaultValue="meals">
                    <TabsList className="w-full mb-4">
                        <TabsTrigger value="meals" className="flex-1">وعده‌ها</TabsTrigger>
                        <TabsTrigger value="reminders" className="flex-1">یادآورها</TabsTrigger>
                    </TabsList>

                    <TabsContent value="meals" className="space-y-3">
                        {plan.meals.map((meal) => {
                            const isCompleted = completedMealIds.has(meal.id);
                            const currentTime = new Date().toTimeString().slice(0, 5);
                            const isPast = meal.scheduledTime < currentTime;
                            const isCurrent = !isCompleted && isPast;

                            return (
                                <Card
                                    key={meal.id}
                                    className={cn(
                                        "transition-all",
                                        isCompleted && "bg-green-50 border-green-200",
                                        isCurrent && "ring-2 ring-green-500 shadow-lg"
                                    )}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{mealTypeIcons[meal.mealType]}</span>
                                                <div>
                                                    <h3 className="font-bold">{meal.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{meal.scheduledTime}</span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {mealTypeLabels[meal.mealType]}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {isCompleted ? (
                                                <Badge className="bg-green-500">
                                                    <Check className="w-4 h-4 ml-1" />
                                                    خوردم
                                                </Badge>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => logMealMutation.mutate({ mealId: meal.id })}
                                                    disabled={logMealMutation.isPending}
                                                >
                                                    خوردم ✓
                                                </Button>
                                            )}
                                        </div>

                                        {/* Meal Items */}
                                        <div className="space-y-2 mb-3">
                                            {meal.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-2"
                                                >
                                                    <span>{item.name}</span>
                                                    <span className="text-muted-foreground">{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Macros */}
                                        {(meal.calories || meal.protein || meal.carbs || meal.fat) && (
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                                {meal.calories && (
                                                    <span className="flex items-center gap-1">
                                                        <Flame className="w-3 h-3 text-orange-500" />
                                                        {meal.calories} کالری
                                                    </span>
                                                )}
                                                {meal.protein && (
                                                    <span className="flex items-center gap-1">
                                                        <Beef className="w-3 h-3 text-red-500" />
                                                        {meal.protein}g
                                                    </span>
                                                )}
                                                {meal.carbs && (
                                                    <span className="flex items-center gap-1">
                                                        <Wheat className="w-3 h-3 text-amber-500" />
                                                        {meal.carbs}g
                                                    </span>
                                                )}
                                                {meal.fat && (
                                                    <span className="flex items-center gap-1">
                                                        <Droplets className="w-3 h-3 text-blue-500" />
                                                        {meal.fat}g
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </TabsContent>

                    <TabsContent value="reminders" className="space-y-3">
                        {/* Push notification toggle */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="font-medium">نوتیفیکیشن‌ها</p>
                                            <p className="text-sm text-muted-foreground">
                                                {isSubscribed ? "فعال است" : "غیرفعال است"}
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isSubscribed}
                                        onCheckedChange={() => isSubscribed ? unsubscribe() : subscribe()}
                                        disabled={pushLoading || !isSupported}
                                    />
                                </div>
                                {!isSupported && (
                                    <p className="text-xs text-destructive mt-2">
                                        مرورگر شما از نوتیفیکیشن پشتیبانی نمی‌کند
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Individual meal reminders */}
                        {reminders.map((reminder) => (
                            <Card key={reminder.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{mealTypeIcons[reminder.meal.mealType]}</span>
                                            <div>
                                                <p className="font-medium">{reminder.meal.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ساعت {reminder.reminderTime}
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={reminder.isEnabled}
                                            onCheckedChange={(checked) =>
                                                toggleReminderMutation.mutate({
                                                    reminderId: reminder.id,
                                                    isEnabled: checked
                                                })
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div >
        </div >
    );
}
