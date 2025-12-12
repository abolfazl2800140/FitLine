import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { translations } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Send, Loader2 } from "lucide-react";

const categories = [
    { value: "general", label: "عمومی" },
    { value: "nutrition", label: "تغذیه" },
    { value: "training", label: "تمرین" },
    { value: "supplements", label: "مکمل" },
    { value: "injury", label: "آسیب‌دیدگی" },
];

export default function AskQuestionPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("general");

    const createQuestionMutation = useMutation({
        mutationFn: async () => {
            return apiRequest("POST", "/api/questions", { title, content, category });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
            toast({
                title: "سوال ثبت شد",
                description: "سوال شما با موفقیت ثبت شد",
            });
            setLocation("/education");
        },
        onError: () => {
            toast({
                title: "خطا",
                description: "مشکلی در ثبت سوال پیش آمد",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            toast({
                title: "خطا",
                description: "لطفاً عنوان و توضیحات سوال را وارد کنید",
                variant: "destructive",
            });
            return;
        }
        createQuestionMutation.mutate();
    };

    return (
        <div className="min-h-screen bg-background pb-24" dir="rtl">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
                <div className="flex items-center justify-between px-4 h-14 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/education")}
                        className="rounded-xl text-primary-foreground hover:bg-white/20"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <span className="text-xl italic font-bold text-primary-foreground absolute left-1/2 -translate-x-1/2">FitLine</span>
                    <div className="w-10" />
                </div>
            </div>
            {/* Spacer for fixed header */}
            <div className="h-14" />

            <div className="container max-w-2xl px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">پرسیدن سوال</h1>
                    <p className="text-muted-foreground">
                        سوال خود را بپرسید و از تجربه دیگران یاد بگیرید
                    </p>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">عنوان سوال</Label>
                            <Input
                                placeholder="سوال خود را به صورت خلاصه بنویسید..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">توضیحات</Label>
                            <Textarea
                                placeholder="جزئیات بیشتر درباره سوال خود بنویسید..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="min-h-[150px] resize-none"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">دسته‌بندی</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[60]">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={createQuestionMutation.isPending || !title.trim() || !content.trim()}
                            className="w-full gap-2 h-12 text-base"
                        >
                            {createQuestionMutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                            ثبت سوال
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
