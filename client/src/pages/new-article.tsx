import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, Image, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const categories = [
  { value: "nutrition", label: "تغذیه" },
  { value: "training", label: "تمرین" },
  { value: "recovery", label: "ریکاوری" },
  { value: "motivation", label: "انگیزشی" },
  { value: "supplements", label: "مکمل" },
  { value: "lifestyle", label: "سبک زندگی" },
];

export default function NewArticlePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [readingTime, setReadingTime] = useState(5);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/articles", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "مقاله منتشر شد",
        description: "مقاله شما با موفقیت منتشر شد",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      setLocation("/learn");
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "مشکلی در انتشار مقاله پیش آمد",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: "عنوان مقاله را وارد کنید", variant: "destructive" });
      return;
    }
    if (!content.trim()) {
      toast({ title: "محتوای مقاله را وارد کنید", variant: "destructive" });
      return;
    }
    if (!category) {
      toast({ title: "دسته‌بندی را انتخاب کنید", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      title,
      excerpt,
      content,
      category,
      coverImage: coverImage || null,
      readingTime,
    });
  };

  // Redirect if not coach
  if (currentUser && currentUser.role !== "coach") {
    setLocation("/learn");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/learn")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <h1 className="font-bold">نوشتن مقاله جدید</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label>عنوان مقاله *</Label>
          <Input
            placeholder="عنوان جذاب برای مقاله..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>دسته‌بندی *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="انتخاب دسته‌بندی" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label>خلاصه (اختیاری)</Label>
          <Textarea
            placeholder="یک خلاصه کوتاه از مقاله..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label>لینک تصویر کاور (اختیاری)</Label>
          <Input
            placeholder="https://example.com/image.jpg"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
          {coverImage && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={coverImage}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Reading Time */}
        <div className="space-y-2">
          <Label>زمان مطالعه (دقیقه)</Label>
          <Input
            type="number"
            min={1}
            max={60}
            value={readingTime}
            onChange={(e) => setReadingTime(parseInt(e.target.value) || 5)}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label>محتوای مقاله *</Label>
          <Textarea
            placeholder="متن کامل مقاله را اینجا بنویسید...

می‌توانید از پاراگراف‌های جداگانه استفاده کنید.

نکات مهم را با خط جدید مشخص کنید."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {content.length} کاراکتر
          </p>
        </div>

        {/* Submit */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              در حال انتشار...
            </>
          ) : (
            "انتشار مقاله"
          )}
        </Button>
      </div>
    </div>
  );
}
