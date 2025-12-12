import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    Plus, Trash2, ChevronRight, Apple, Clock,
    Flame, Beef, Wheat, Droplets, Send, User
} from "lucide-react";

interface MealItem {
    name: string;
    quantity: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
}

interface Meal {
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

const mealTypes = [
    { value: "breakfast", label: "صبحانه", icon: "🌅", defaultTime: "07:30" },
    { value: "morning_snack", label: "میان‌وعده صبح", icon: "🍎", defaultTime: "10:00" },
    { value: "lunch", label: "ناهار", icon: "🍽️", defaultTime: "13:00" },
    { value: "afternoon_snack", label: "میان‌وعده عصر", icon: "🥤", defaultTime: "16:00" },
    { value: "dinner", label: "شام", icon: "🌙", defaultTime: "20:00" },
    { value: "evening_snack", label: "میان‌وعده شب", icon: "🥛", defaultTime: "22:00" },
];

export default function NutritionBuilderPage() {
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const searchParams = new URLSearchParams(window.location.search);
    const studentId = searchParams.get("studentId");

    const [title, setTitle] = useState("برنامه تغذیه");
    const [description, setDescription] = useState("");
    const [dailyCalories, setDailyCalories] = useState<number | undefined>();
    const [dailyProtein, setDailyProtein] = useState<number | undefined>();
    const [dailyCarbs, setDailyCarbs] = useState<number | undefined>();
    const [dailyFat, setDailyFat] = useState<number | undefined>();
    const [meals, setMeals] = useState<Meal[]>([]);

    // Fetch students
    const { data: students = [] } = useQuery<any[]>({
        queryKey: ["/api/coach/students"],
    });

    const [selectedStudent, setSelectedStudent] = useState(studentId || "");

    // Create nutrition plan
    const createPlanMutation = useMutation({
        mutationFn: async () => {
            if (!selectedStudent) throw new Error("لطفاً شاگرد را انتخاب کنید");
            if (meals.length === 0) throw new Error("حداقل یک وعده اضافه کنید");

            const res = await fetch("/api/nutrition-plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedStudent,
                    title,
                    description,
                    dailyCalories,
                    dailyProtein,
                    dailyCarbs,
                    dailyFat,
                    startDate: new Date().toISOString(),
                    meals,
                }),
                credentials: "include",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "خطا در ایجاد برنامه");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "برنامه ارسال شد! 🎉",
                description: "برنامه تغذیه با موفقیت برای شاگرد ارسال شد",
            });
            navigate("/coach/students");
        },
        onError: (error: Error) => {
            toast({
                title: "خطا",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const addMeal = () => {
        const usedTypes = meals.map(m => m.mealType);
        const availableType = mealTypes.find(t => !usedTypes.includes(t.value));

        if (!availableType) {
            toast({
                title: "محدودیت",
                description: "تمام انواع وعده‌ها اضافه شده‌اند",
                variant: "destructive",
            });
            return;
        }

        setMeals([...meals, {
            mealType: availableType.value,
            title: availableType.label,
            scheduledTime: availableType.defaultTime,
            items: [],
        }]);
    };

    const updateMeal = (index: number, updates: Partial<Meal>) => {
        const newMeals = [...meals];
        newMeals[index] = { ...newMeals[index], ...updates };
        setMeals(newMeals);
    };

    const removeMeal = (index: number) => {
        setMeals(meals.filter((_, i) => i !== index));
    };

    const addMealItem = (mealIndex: number) => {
        const newMeals = [...meals];
        newMeals[mealIndex].items.push({
            name: "",
            quantity: "",
        });
        setMeals(newMeals);
    };

    const updateMealItem = (mealIndex: number, itemIndex: number, updates: Partial<MealItem>) => {
        const newMeals = [...meals];
        newMeals[mealIndex].items[itemIndex] = {
            ...newMeals[mealIndex].items[itemIndex],
            ...updates,
        };
        setMeals(newMeals);
    };

    const removeMealItem = (mealIndex: number, itemIndex: number) => {
        const newMeals = [...meals];
        newMeals[mealIndex].items = newMeals[mealIndex].items.filter((_, i) => i !== itemIndex);
        setMeals(newMeals);
    };

    // Calculate totals
    const calculateMealTotals = (meal: Meal) => {
        return meal.items.reduce((acc, item) => ({
            calories: acc.calories + (item.calories || 0),
            protein: acc.protein + (item.protein || 0),
            carbs: acc.carbs + (item.carbs || 0),
            fat: acc.fat + (item.fat || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => navigate("/coach/students")}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                    <h1 className="text-xl font-bold">ساخت برنامه تغذیه</h1>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Student Selection */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="w-5 h-5" />
                            انتخاب شاگرد
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                            <SelectTrigger>
                                <SelectValue placeholder="شاگرد را انتخاب کنید" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((student: any) => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Plan Info */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Apple className="w-5 h-5" />
                            اطلاعات برنامه
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>عنوان برنامه</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="مثلاً: برنامه کاهش وزن"
                            />
                        </div>
                        <div>
                            <Label>توضیحات</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="توضیحات کلی برنامه..."
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="flex items-center gap-1">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    کالری روزانه
                                </Label>
                                <Input
                                    type="number"
                                    value={dailyCalories || ""}
                                    onChange={(e) => setDailyCalories(e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="2000"
                                />
                            </div>
                            <div>
                                <Label className="flex items-center gap-1">
                                    <Beef className="w-4 h-4 text-red-500" />
                                    پروتئین (گرم)
                                </Label>
                                <Input
                                    type="number"
                                    value={dailyProtein || ""}
                                    onChange={(e) => setDailyProtein(e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="150"
                                />
                            </div>
                            <div>
                                <Label className="flex items-center gap-1">
                                    <Wheat className="w-4 h-4 text-amber-500" />
                                    کربوهیدرات (گرم)
                                </Label>
                                <Input
                                    type="number"
                                    value={dailyCarbs || ""}
                                    onChange={(e) => setDailyCarbs(e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="200"
                                />
                            </div>
                            <div>
                                <Label className="flex items-center gap-1">
                                    <Droplets className="w-4 h-4 text-blue-500" />
                                    چربی (گرم)
                                </Label>
                                <Input
                                    type="number"
                                    value={dailyFat || ""}
                                    onChange={(e) => setDailyFat(e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder="60"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Meals */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold">وعده‌های غذایی</h2>
                        <Button size="sm" onClick={addMeal}>
                            <Plus className="w-4 h-4 ml-1" />
                            افزودن وعده
                        </Button>
                    </div>

                    {meals.map((meal, mealIndex) => {
                        const mealType = mealTypes.find(t => t.value === meal.mealType);
                        const totals = calculateMealTotals(meal);

                        return (
                            <Card key={mealIndex}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{mealType?.icon}</span>
                                            <Select
                                                value={meal.mealType}
                                                onValueChange={(value) => {
                                                    const newType = mealTypes.find(t => t.value === value);
                                                    updateMeal(mealIndex, {
                                                        mealType: value,
                                                        title: newType?.label || meal.title,
                                                        scheduledTime: newType?.defaultTime || meal.scheduledTime,
                                                    });
                                                }}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mealTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.icon} {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => removeMeal(mealIndex)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label>عنوان</Label>
                                            <Input
                                                value={meal.title}
                                                onChange={(e) => updateMeal(mealIndex, { title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                ساعت
                                            </Label>
                                            <Input
                                                type="time"
                                                value={meal.scheduledTime}
                                                onChange={(e) => updateMeal(mealIndex, { scheduledTime: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Meal Items */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>مواد غذایی</Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addMealItem(mealIndex)}
                                            >
                                                <Plus className="w-3 h-3 ml-1" />
                                                افزودن
                                            </Button>
                                        </div>

                                        {meal.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex gap-2 items-start bg-muted/50 p-2 rounded-lg">
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <Input
                                                        placeholder="نام غذا"
                                                        value={item.name}
                                                        onChange={(e) => updateMealItem(mealIndex, itemIndex, { name: e.target.value })}
                                                    />
                                                    <Input
                                                        placeholder="مقدار (مثلاً 2 عدد)"
                                                        value={item.quantity}
                                                        onChange={(e) => updateMealItem(mealIndex, itemIndex, { quantity: e.target.value })}
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="کالری"
                                                        value={item.calories || ""}
                                                        onChange={(e) => updateMealItem(mealIndex, itemIndex, { calories: e.target.value ? Number(e.target.value) : undefined })}
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="پروتئین (g)"
                                                        value={item.protein || ""}
                                                        onChange={(e) => updateMealItem(mealIndex, itemIndex, { protein: e.target.value ? Number(e.target.value) : undefined })}
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive shrink-0"
                                                    onClick={() => removeMealItem(mealIndex, itemIndex)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Meal Totals */}
                                    {meal.items.length > 0 && (
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                            <span>مجموع:</span>
                                            <span className="flex items-center gap-1">
                                                <Flame className="w-3 h-3 text-orange-500" />
                                                {totals.calories} کالری
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Beef className="w-3 h-3 text-red-500" />
                                                {totals.protein}g
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    {meals.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <Apple className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>هنوز وعده‌ای اضافه نشده</p>
                                <Button variant="outline" className="mt-3" onClick={addMeal}>
                                    <Plus className="w-4 h-4 ml-1" />
                                    افزودن اولین وعده
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    className="w-full"
                    size="lg"
                    onClick={() => createPlanMutation.mutate()}
                    disabled={createPlanMutation.isPending || !selectedStudent || meals.length === 0}
                >
                    <Send className="w-5 h-5 ml-2" />
                    {createPlanMutation.isPending ? "در حال ارسال..." : "ارسال برنامه به شاگرد"}
                </Button>
            </div>
        </div>
    );
}
