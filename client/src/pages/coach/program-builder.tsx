import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
    Plus,
    GripVertical,
    Trash2,
    Copy,
    ChevronDown,
    ChevronUp,
    Send,
    User,
    Dumbbell,
    Calendar,
    X,
    Check,
    MoreVertical,
} from "lucide-react";
import { toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    rest?: number;
    note?: string;
}

interface WorkoutDay {
    id: string;
    title: string;
    exercises: Exercise[];
    isExpanded: boolean;
}

// Parse text input like "اسکات ۴×۱۲" or "پرس سینه 3x10"
function parseExerciseInput(input: string): Partial<Exercise> | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Pattern: name sets×reps or name sets*reps or name setsxreps
    const patterns = [
        /^(.+?)\s*(\d+)\s*[×xX\*]\s*(\d+)$/,
        /^(.+?)\s*(\d+)\s*ست\s*(\d+)\s*تا?$/,
        /^(.+?)\s*(\d+)\s*[×xX\*]\s*(\d+[-–]\d+)$/,
    ];

    for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match) {
            return {
                name: match[1].trim(),
                sets: parseInt(match[2]),
                reps: match[3],
            };
        }
    }

    // If no pattern matched, just use the name
    return { name: trimmed, sets: 3, reps: "12" };
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

const persianDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

export default function ProgramBuilderPage() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const searchParams = new URLSearchParams(window.location.search);
    const studentIdFromUrl = searchParams.get("student");
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [programTitle, setProgramTitle] = useState("");
    const [weeks, setWeeks] = useState(4);
    const [days, setDays] = useState<WorkoutDay[]>([
        { id: generateId(), title: "روز ۱ - پا", exercises: [], isExpanded: true },
    ]);

    // Mutation for creating program
    const createProgramMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/programs/create-for-student", data);
        },
        onSuccess: () => {
            toast({
                title: "برنامه ارسال شد",
                description: `برنامه برای ${selectedStudent?.fullName} ارسال شد`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/coach/students"] });
            setLocation("/coach");
        },
        onError: (error: Error) => {
            toast({
                title: "خطا",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    const [studentSheetOpen, setStudentSheetOpen] = useState(false);
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const { data: user } = useQuery<any>({
        queryKey: ["/api/auth/me"],
    });

    // Fetch real students from API
    const { data: students } = useQuery<any[]>({
        queryKey: ["/api/coach/students"],
        enabled: !!user && user.role === "coach",
    });

    // Also fetch accepted coaching requests (students waiting for program)
    const { data: requests } = useQuery<any[]>({
        queryKey: ["/api/coach/requests"],
        enabled: !!user && user.role === "coach",
    });

    // Combine students and accepted requests
    const acceptedRequests = (requests || [])
        .filter((r: any) => r.status === "accepted")
        .map((r: any) => ({
            id: r.user?.id,
            fullName: r.user?.fullName,
            avatar: r.user?.avatar,
            goal: r.goal,
            fromRequest: true,
        }));

    const allStudents = [
        ...(students || []).map((s: any) => ({
            id: s.id,
            fullName: s.fullName,
            avatar: s.avatar,
            goal: s.programTitle || "شاگرد فعال",
        })),
        ...acceptedRequests.filter((r: any) =>
            !(students || []).some((s: any) => s.id === r.id)
        ),
    ];

    // Auto-select student from URL param
    useEffect(() => {
        if (studentIdFromUrl && allStudents.length > 0 && !selectedStudent) {
            const student = allStudents.find((s: any) => s.id === studentIdFromUrl);
            if (student) {
                setSelectedStudent(student);
            }
        }
    }, [studentIdFromUrl, allStudents, selectedStudent]);

    const addDay = () => {
        const dayNum = days.length + 1;
        setDays([
            ...days,
            {
                id: generateId(),
                title: `روز ${toPersianNumber(dayNum)}`,
                exercises: [],
                isExpanded: true,
            },
        ]);
    };

    const removeDay = (dayId: string) => {
        if (days.length === 1) {
            toast({ title: "حداقل یک روز باید وجود داشته باشد", variant: "destructive" });
            return;
        }
        setDays(days.filter((d) => d.id !== dayId));
    };

    const duplicateDay = (dayId: string) => {
        const dayIndex = days.findIndex((d) => d.id === dayId);
        if (dayIndex === -1) return;

        const day = days[dayIndex];
        const newDay: WorkoutDay = {
            id: generateId(),
            title: `${day.title} (کپی)`,
            exercises: day.exercises.map((e) => ({ ...e, id: generateId() })),
            isExpanded: true,
        };

        const newDays = [...days];
        newDays.splice(dayIndex + 1, 0, newDay);
        setDays(newDays);
    };

    const toggleDayExpand = (dayId: string) => {
        setDays(
            days.map((d) =>
                d.id === dayId ? { ...d, isExpanded: !d.isExpanded } : d
            )
        );
    };

    const updateDayTitle = (dayId: string, title: string) => {
        setDays(days.map((d) => (d.id === dayId ? { ...d, title } : d)));
    };

    const addExercise = (dayId: string, exercise: Partial<Exercise>) => {
        const newExercise: Exercise = {
            id: generateId(),
            name: exercise.name || "",
            sets: exercise.sets || 3,
            reps: exercise.reps || "12",
            rest: exercise.rest,
            note: exercise.note,
        };

        setDays(
            days.map((d) =>
                d.id === dayId
                    ? { ...d, exercises: [...d.exercises, newExercise] }
                    : d
            )
        );
    };

    const updateExercise = (dayId: string, exerciseId: string, updates: Partial<Exercise>) => {
        setDays(
            days.map((d) =>
                d.id === dayId
                    ? {
                        ...d,
                        exercises: d.exercises.map((e) =>
                            e.id === exerciseId ? { ...e, ...updates } : e
                        ),
                    }
                    : d
            )
        );
    };

    const removeExercise = (dayId: string, exerciseId: string) => {
        setDays(
            days.map((d) =>
                d.id === dayId
                    ? { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) }
                    : d
            )
        );
    };

    const handleExerciseInput = (dayId: string, inputId: string, value: string) => {
        if (value.endsWith("\n") || value.endsWith("،")) {
            const cleanValue = value.replace(/[\n،]/g, "");
            const parsed = parseExerciseInput(cleanValue);
            if (parsed && parsed.name) {
                addExercise(dayId, parsed);
                // Clear input
                const input = inputRefs.current[inputId];
                if (input) input.value = "";
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, dayId: string, inputId: string) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const input = inputRefs.current[inputId];
            if (input && input.value.trim()) {
                const parsed = parseExerciseInput(input.value);
                if (parsed && parsed.name) {
                    addExercise(dayId, parsed);
                    input.value = "";
                }
            }
        }
    };

    const handleSendProgram = () => {
        if (!selectedStudent) {
            toast({ title: "لطفاً یک شاگرد انتخاب کنید", variant: "destructive" });
            return;
        }

        const totalExercises = days.reduce((sum, d) => sum + d.exercises.length, 0);
        if (totalExercises === 0) {
            toast({ title: "برنامه خالی است", variant: "destructive" });
            return;
        }

        // Send program to API
        createProgramMutation.mutate({
            studentId: selectedStudent.id,
            title: programTitle || "برنامه تمرینی",
            durationWeeks: weeks,
            days: days.map(d => ({
                title: d.title,
                exercises: d.exercises.map(e => ({
                    name: e.name,
                    sets: e.sets,
                    reps: e.reps,
                })),
            })),
        });
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-primary backdrop-blur-sm">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between relative">
                        <Button
                            onClick={handleSendProgram}
                            className="gap-2 bg-white text-primary hover:bg-white/90"
                            disabled={createProgramMutation.isPending}
                        >
                            {createProgramMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {createProgramMutation.isPending ? "در حال ارسال..." : "ارسال"}
                        </Button>
                        <span className="text-xl italic font-bold text-primary-foreground absolute left-1/2 -translate-x-1/2">FitLine</span>
                        <div className="w-20" />
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* Student Selection */}
                <Card className="border-dashed border-2 border-primary/30">
                    <CardContent className="p-4">
                        <Sheet open={studentSheetOpen} onOpenChange={setStudentSheetOpen}>
                            <SheetTrigger asChild>
                                <button className="w-full flex items-center gap-3 text-right">
                                    {selectedStudent ? (
                                        <>
                                            <Avatar className="h-12 w-12 border-2 border-primary">
                                                <AvatarImage src={selectedStudent.avatar} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {selectedStudent.fullName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-bold">{selectedStudent.fullName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedStudent.goal}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">تغییر</Badge>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-muted-foreground">انتخاب شاگرد</p>
                                                <p className="text-sm text-muted-foreground/70">
                                                    برای چه کسی برنامه می‌نویسید؟
                                                </p>
                                            </div>
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        </>
                                    )}
                                </button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[60vh]">
                                <SheetHeader>
                                    <SheetTitle>انتخاب شاگرد</SheetTitle>
                                </SheetHeader>
                                <div className="mt-4 space-y-2">
                                    {allStudents.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>هنوز شاگردی ندارید</p>
                                            <p className="text-sm">ابتدا درخواست‌های برنامه را قبول کنید</p>
                                        </div>
                                    ) : (
                                        allStudents.map((student) => (
                                            <button
                                                key={student.id}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                                                    selectedStudent?.id === student.id
                                                        ? "bg-primary/10 border-2 border-primary"
                                                        : "bg-card hover:bg-muted"
                                                )}
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setStudentSheetOpen(false);
                                                }}
                                            >
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={student.avatar} />
                                                    <AvatarFallback>{student.fullName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 text-right">
                                                    <p className="font-medium">{student.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">{student.goal}</p>
                                                </div>
                                                {selectedStudent?.id === student.id && (
                                                    <Check className="h-5 w-5 text-primary" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </CardContent>
                </Card>

                {/* Program Info */}
                <div className="flex gap-3">
                    <Input
                        placeholder="عنوان برنامه (اختیاری)"
                        value={programTitle}
                        onChange={(e) => setProgramTitle(e.target.value)}
                        className="flex-1"
                    />
                    <Select value={weeks.toString()} onValueChange={(v) => setWeeks(parseInt(v))}>
                        <SelectTrigger className="w-28">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 6, 8, 12].map((w) => (
                                <SelectItem key={w} value={w.toString()}>
                                    {toPersianNumber(w)} هفته
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Workout Days */}
                <div className="space-y-3">
                    {days.map((day, dayIndex) => (
                        <Card key={day.id} className="overflow-hidden">
                            {/* Day Header */}
                            <button
                                className="w-full flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted transition-colors"
                                onClick={() => toggleDayExpand(day.id)}
                            >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={day.title}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        updateDayTitle(day.id, e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 bg-transparent border-0 p-0 h-auto font-bold focus-visible:ring-0"
                                />
                                <Badge variant="secondary" className="text-xs">
                                    {toPersianNumber(day.exercises.length)} تمرین
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            duplicateDay(day.id);
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeDay(day.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    {day.isExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </div>
                            </button>

                            {/* Day Content */}
                            {day.isExpanded && (
                                <CardContent className="p-3 space-y-2">
                                    {/* Exercises List */}
                                    {day.exercises.map((exercise, exIndex) => (
                                        <div
                                            key={exercise.id}
                                            className="flex items-center gap-2 p-2 bg-card rounded-lg border group"
                                        >
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                            <span className="text-xs text-muted-foreground w-5">
                                                {toPersianNumber(exIndex + 1)}
                                            </span>
                                            <Input
                                                value={exercise.name}
                                                onChange={(e) =>
                                                    updateExercise(day.id, exercise.id, { name: e.target.value })
                                                }
                                                className="flex-1 bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                                                placeholder="نام تمرین"
                                            />
                                            <div className="flex items-center gap-1 text-sm">
                                                <div
                                                    className="w-10 text-center bg-muted p-1 h-7 rounded flex items-center justify-center cursor-pointer hover:bg-muted/80"
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => {
                                                        const val = e.currentTarget.textContent?.replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728)) || "0";
                                                        updateExercise(day.id, exercise.id, { sets: parseInt(val) || 0 });
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                >
                                                    {toPersianNumber(exercise.sets)}
                                                </div>
                                                <span className="text-muted-foreground">×</span>
                                                <div
                                                    className="w-14 text-center bg-muted p-1 h-7 rounded flex items-center justify-center cursor-pointer hover:bg-muted/80"
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => {
                                                        const val = e.currentTarget.textContent || "12";
                                                        updateExercise(day.id, exercise.id, { reps: val });
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                >
                                                    {toPersianNumber(exercise.reps)}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                                onClick={() => removeExercise(day.id, exercise.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    {/* Quick Add Input */}
                                    <div className="flex items-center gap-2 p-2 border-2 border-dashed rounded-lg">
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            ref={(el) => (inputRefs.current[`input-${day.id}`] = el)}
                                            placeholder="تایپ کنید: اسکات ۴×۱۲"
                                            className="flex-1 bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                                            onKeyDown={(e) => handleKeyDown(e, day.id, `input-${day.id}`)}
                                        />
                                        <span className="text-xs text-muted-foreground">Enter ↵</span>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}

                    {/* Add Day Button */}
                    <Button
                        variant="outline"
                        className="w-full border-dashed border-2 gap-2"
                        onClick={addDay}
                    >
                        <Plus className="h-4 w-4" />
                        افزودن روز جدید
                    </Button>
                </div>
            </div>
        </div>
    );
}
