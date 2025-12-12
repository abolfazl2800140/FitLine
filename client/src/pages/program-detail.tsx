import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { toPersianNumber } from "@/lib/persian";
import {
    ArrowRight,
    Dumbbell,
    Calendar,
    CheckCircle2,
    Circle,
    Play,
} from "lucide-react";

export default function ProgramDetailPage() {
    const params = useParams<{ id: string }>();
    const [, setLocation] = useLocation();
    const [completedDays, setCompletedDays] = useState<string[]>([]);

    const { data: program, isLoading } = useQuery<any>({
        queryKey: ["/api/programs", params.id, "full"],
        queryFn: async () => {
            const res = await fetch(`/api/programs/${params.id}/full`);
            if (!res.ok) throw new Error("Program not found");
            return res.json();
        },
        enabled: !!params.id,
    });

    const toggleDayComplete = (dayId: string) => {
        setCompletedDays(prev =>
            prev.includes(dayId)
                ? prev.filter(id => id !== dayId)
                : [...prev, dayId]
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pb-20" dir="rtl">
                <div className="h-14 bg-primary" />
                <div className="container max-w-2xl px-4 py-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-48 bg-muted rounded" />
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-muted rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">برنامه یافت نشد</p>
                    <Button onClick={() => setLocation("/my-programs")}>بازگشت</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20" dir="rtl">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
                <div className="flex items-center gap-3 px-4 h-14">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/my-programs")}
                        className="rounded-full text-primary-foreground hover:bg-white/20"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold text-primary-foreground">{program.title}</h1>
                </div>
            </div>
            <div className="h-14" />

            <div className="container max-w-2xl px-4 py-6">
                {/* Program Info */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <Link href={`/user/${program.coachId || program.coach?.id}`}>
                            <div className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={program.coach?.avatar} />
                                    <AvatarFallback>{program.coach?.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{program.coach?.fullName}</p>
                                    <p className="text-sm text-muted-foreground">مربی شما</p>
                                </div>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {toPersianNumber(program.durationWeeks)} هفته
                            </span>
                            <span className="flex items-center gap-1">
                                <Dumbbell className="h-4 w-4" />
                                {toPersianNumber(program.days?.length || 0)} روز تمرین
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Workout Days */}
                <h2 className="font-bold text-lg mb-4">روزهای تمرین</h2>
                <Accordion type="single" collapsible className="space-y-3">
                    {program.days?.map((day: any, index: number) => {
                        const isCompleted = completedDays.includes(day.id);
                        return (
                            <AccordionItem
                                key={day.id}
                                value={day.id}
                                className="border rounded-xl overflow-hidden"
                            >
                                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div
                                            className={`h-10 w-10 rounded-full flex items-center justify-center ${isCompleted ? "bg-primary text-white" : "bg-muted"
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                <span className="font-bold">{toPersianNumber(index + 1)}</span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{day.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {toPersianNumber(day.exercises?.length || 0)} تمرین
                                            </p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-3">
                                        {day.exercises?.map((exercise: any, exIndex: number) => (
                                            <div
                                                key={exercise.id}
                                                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                    {toPersianNumber(exIndex + 1)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{exercise.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {toPersianNumber(exercise.sets)} ست × {toPersianNumber(exercise.reps)} تکرار
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        className="w-full mt-4 gap-2"
                                        variant={isCompleted ? "outline" : "default"}
                                        onClick={() => toggleDayComplete(day.id)}
                                    >
                                        {isCompleted ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                انجام شد
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4" />
                                                شروع تمرین
                                            </>
                                        )}
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>
        </div>
    );
}
