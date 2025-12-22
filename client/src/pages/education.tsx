import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QuestionCard, QuestionCardSkeleton } from "@/components/ui/question-card";
import { translations } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  HelpCircle,
  MessageSquare,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const categories = [
  { value: "all", label: "همه" },
  { value: "nutrition", label: translations.education.categories.nutrition },
  { value: "training", label: translations.education.categories.training },
  { value: "supplements", label: translations.education.categories.supplements },
  { value: "injury", label: translations.education.categories.injury },
  { value: "general", label: translations.education.categories.general },
];

export default function EducationPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "", category: "general" });
  const { toast } = useToast();

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: questions, isLoading } = useQuery<any[]>({
    queryKey: ["/api/questions"],
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: typeof newQuestion) => {
      return apiRequest("POST", "/api/questions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setDialogOpen(false);
      setNewQuestion({ title: "", content: "", category: "general" });
      toast({
        title: "سوال ثبت شد",
        description: "سوال شما با موفقیت ثبت شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "مشکلی در ثبت سوال پیش آمد",
        variant: "destructive",
      });
    },
  });

  const handleSubmitQuestion = () => {
    if (newQuestion.title.trim() && newQuestion.content.trim()) {
      createQuestionMutation.mutate(newQuestion);
    }
  };

  const filteredQuestions = questions?.filter((q: any) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesTitle = q.title?.toLowerCase().includes(searchLower);
      const matchesContent = q.content?.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesContent) return false;
    }
    if (category !== "all" && q.category !== category) return false;
    return true;
  }) || [];

  return (
    <div>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
        <div className="container px-4 md:px-6 h-14 flex items-center justify-between relative">
          <Button
            size="icon"
            className="bg-white text-primary hover:bg-white/90"
            data-testid="button-ask-question"
            onClick={() => setLocation("/education/ask")}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-lg italic font-semibold text-primary-foreground absolute left-1/2 -translate-x-1/2">FitLine</span>
          <div className="w-10" />
        </div>
      </div>
      {/* Spacer for fixed header */}
      <div className="h-14" />

      <div className="container px-4 md:px-6 py-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <span></span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{translations.education.askQuestion}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>عنوان سوال</Label>
                <Input
                  placeholder="سوال خود را به صورت خلاصه بنویسید..."
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  data-testid="input-question-title"
                />
              </div>
              <div className="space-y-2">
                <Label>توضیحات</Label>
                <Textarea
                  placeholder="جزئیات بیشتر درباره سوال خود بنویسید..."
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  className="min-h-[120px] resize-none"
                  data-testid="input-question-content"
                />
              </div>
              <div className="space-y-2">
                <Label>دسته‌بندی</Label>
                <Select
                  value={newQuestion.category}
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}
                >
                  <SelectTrigger data-testid="select-question-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.value !== "all").map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.title.trim() || !newQuestion.content.trim() || createQuestionMutation.isPending}
                data-testid="button-submit-question"
              >
                {createQuestionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "ثبت سوال"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجوی سوال..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
              data-testid="input-search-questions"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
          {categories.map((cat) => (
            <Badge
              key={cat.value}
              variant={category === cat.value ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap px-4 py-2 min-h-[44px] flex items-center"
              onClick={() => setCategory(cat.value)}
              data-testid={`badge-category-${cat.value}`}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <QuestionCardSkeleton key={i} />
          ))
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map((question: any) => (
            <QuestionCard
              key={question.id}
              id={question.id}
              title={question.title}
              content={question.content}
              category={question.category}
              userId={question.userId}
              userName={question.user?.fullName || "کاربر"}
              userAvatar={question.user?.avatar}
              voteCount={question.voteCount || 0}
              answerCount={question.answerCount || 0}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">سوالی یافت نشد</h3>
              <p className="text-muted-foreground mb-4">
                {search || category !== "all"
                  ? "با تغییر فیلترها دوباره جستجو کنید"
                  : "اولین نفری باشید که سوال می‌پرسد!"
                }
              </p>
              {(search || category !== "all") ? (
                <Button variant="outline" className="min-h-[44px]" onClick={() => { setSearch(""); setCategory("all"); }}>
                  پاک کردن فیلترها
                </Button>
              ) : (
                <Button className="min-h-[44px]" onClick={() => setLocation("/education/ask")}>
                  {translations.education.askQuestion}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
