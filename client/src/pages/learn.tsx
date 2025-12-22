import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dumbbell, BookOpen, Heart, Eye, Clock, ChevronLeft,
  Filter, Search, Plus, PenSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianNumber, formatRelativeTime } from "@/lib/persian";
import { useLocation, useSearch } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const muscleGroups = [
  { value: "all", label: "همه" },
  { value: "chest", label: "سینه" },
  { value: "back", label: "پشت" },
  { value: "shoulders", label: "شانه" },
  { value: "biceps", label: "جلو بازو" },
  { value: "triceps", label: "پشت بازو" },
  { value: "legs", label: "پا" },
  { value: "glutes", label: "باسن" },
  { value: "abs", label: "شکم" },
  { value: "cardio", label: "کاردیو" },
];

const articleCategories = [
  { value: "all", label: "همه" },
  { value: "nutrition", label: "تغذیه" },
  { value: "training", label: "تمرین" },
  { value: "recovery", label: "ریکاوری" },
  { value: "motivation", label: "انگیزشی" },
  { value: "supplements", label: "مکمل" },
  { value: "lifestyle", label: "سبک زندگی" },
];

const difficultyLabels: Record<string, string> = {
  beginner: "مبتدی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
  expert: "حرفه‌ای",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500 text-white font-bold shadow-lg",
  intermediate: "bg-yellow-500 text-white font-bold shadow-lg",
  advanced: "bg-orange-500 text-white font-bold shadow-lg",
  expert: "bg-red-500 text-white font-bold shadow-lg",
};

export default function LearnPage() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  
  // Get tab from URL query param
  const urlParams = new URLSearchParams(searchString);
  const tabFromUrl = urlParams.get("tab");
  
  const [activeTab, setActiveTab] = useState(tabFromUrl === "articles" ? "articles" : "tutorials");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Restore scroll position when coming back
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("learn-scroll-position");
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll));
        sessionStorage.removeItem("learn-scroll-position");
      }, 100);
    }
  }, []);

  // Save scroll position before navigating away
  const saveScrollAndNavigate = (path: string) => {
    sessionStorage.setItem("learn-scroll-position", window.scrollY.toString());
    setLocation(path);
  };

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newUrl = tab === "articles" ? "/learn?tab=articles" : "/learn";
    window.history.replaceState(null, "", newUrl);
  };

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const isCoach = currentUser?.role === "coach";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary">
        <div className="flex items-center justify-between px-4 h-14 relative">
          {isCoach ? (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-primary-foreground hover:bg-white/20 min-h-[44px]"
              onClick={() => setLocation("/learn/new-article")}
            >
              <Plus className="h-4 w-4" />
              مقاله جدید
            </Button>
          ) : (
            <div className="w-10" />
          )}
          <span className="text-lg italic font-semibold text-primary-foreground absolute left-1/2 -translate-x-1/2">FitLine</span>
          <div className="w-10" />
        </div>
      </div>
      {/* Spacer for fixed header */}
      <div className="h-14" />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="px-4 pt-4">
          <h1 className="text-xl font-bold mb-1">آموزش‌ها</h1>
          <p className="text-sm text-muted-foreground mb-4">
            یادگیری حرکات و مقالات آموزشی
          </p>
          <TabsList className="w-full grid grid-cols-2 h-12">
            <TabsTrigger value="tutorials" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              آموزش حرکات
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-2">
              <BookOpen className="h-4 w-4" />
              مقالات
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tutorials" className="mt-0">
          <TutorialsTab 
            selectedMuscle={selectedMuscle}
            setSelectedMuscle={setSelectedMuscle}
            onNavigate={saveScrollAndNavigate}
          />
        </TabsContent>

        <TabsContent value="articles" className="mt-0">
          <ArticlesTab
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onNavigate={saveScrollAndNavigate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


// Tutorials Tab Component
function TutorialsTab({ 
  selectedMuscle, 
  setSelectedMuscle,
  onNavigate
}: { 
  selectedMuscle: string;
  setSelectedMuscle: (v: string) => void;
  onNavigate: (path: string) => void;
}) {
  const queryClient = useQueryClient();

  const { data: tutorials, isLoading } = useQuery({
    queryKey: ["/api/tutorials", selectedMuscle],
    queryFn: async () => {
      const params = selectedMuscle !== "all" ? `?muscleGroup=${selectedMuscle}` : "";
      const res = await fetch(`/api/tutorials${params}`);
      return res.json();
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/tutorials/${id}/like`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutorials"] });
    },
  });

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {muscleGroups.map((group) => (
          <Button
            key={group.value}
            variant={selectedMuscle === group.value ? "default" : "outline"}
            size="sm"
            className="shrink-0 rounded-full min-h-[44px] px-4"
            onClick={() => setSelectedMuscle(group.value)}
          >
            {group.label}
          </Button>
        ))}
      </div>

      {/* Tutorials grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <TutorialCardSkeleton key={i} />
          ))}
        </div>
      ) : tutorials?.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-3">هنوز آموزشی اضافه نشده</p>
          <Button variant="outline" className="min-h-[44px]" onClick={() => setSelectedMuscle("all")}>
            مشاهده همه
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {tutorials?.map((tutorial: any) => (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              onLike={() => likeMutation.mutate(tutorial.id)}
              onClick={() => onNavigate(`/learn/tutorial/${tutorial.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TutorialCard({ 
  tutorial, 
  onLike, 
  onClick 
}: { 
  tutorial: any;
  onLike: () => void;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden border-0 bg-card/80">
        <div className="aspect-video relative bg-muted">
          {tutorial.thumbnailUrl ? (
            <img
              src={tutorial.thumbnailUrl}
              alt={tutorial.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          <Badge 
            className={cn(
              "absolute top-2 right-2 text-xs px-2 py-1",
              difficultyColors[tutorial.difficulty]
            )}
          >
            {difficultyLabels[tutorial.difficulty]}
          </Badge>
        </div>
        <CardContent className="p-3 text-right">
          <h3 className="font-semibold text-sm line-clamp-1">{tutorial.name}</h3>
          <div className="flex items-center justify-end gap-2 mt-2 text-xs text-muted-foreground flex-row-reverse">
            <Avatar className="h-5 w-5">
              <AvatarImage src={tutorial.coach?.avatar} />
              <AvatarFallback className="text-[8px]">
                {tutorial.coach?.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{tutorial.coach?.fullName}</span>
          </div>
          <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3 flex-row-reverse">
              <span className="flex items-center gap-1 flex-row-reverse">
                <Heart className="h-3 w-3" />
                {toPersianNumber(tutorial.likeCount || 0)}
              </span>
              <span className="flex items-center gap-1 flex-row-reverse">
                <Eye className="h-3 w-3" />
                {toPersianNumber(tutorial.viewCount || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TutorialCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0">
      <Skeleton className="aspect-video" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  );
}


// Articles Tab Component
function ArticlesTab({ 
  selectedCategory, 
  setSelectedCategory,
  onNavigate
}: { 
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  onNavigate: (path: string) => void;
}) {
  const queryClient = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["/api/articles", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const res = await fetch(`/api/articles${params}`);
      return res.json();
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/articles/${id}/like`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
  });

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {articleCategories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? "default" : "outline"}
            size="sm"
            className="shrink-0 rounded-full min-h-[44px] px-4"
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Articles list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : articles?.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-3">هنوز مقاله‌ای اضافه نشده</p>
          <Button variant="outline" className="min-h-[44px]" onClick={() => setSelectedCategory("all")}>
            مشاهده همه
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles?.map((article: any) => (
            <ArticleCard
              key={article.id}
              article={article}
              onLike={() => likeMutation.mutate(article.id)}
              onClick={() => onNavigate(`/learn/article/${article.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({ 
  article, 
  onLike, 
  onClick 
}: { 
  article: any;
  onLike: () => void;
  onClick: () => void;
}) {
  const categoryLabels: Record<string, string> = {
    nutrition: "تغذیه",
    training: "تمرین",
    recovery: "ریکاوری",
    motivation: "انگیزشی",
    supplements: "مکمل",
    lifestyle: "سبک زندگی",
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden border-0 bg-card/80">
        <div className="flex flex-row-reverse gap-3 p-3">
          {article.coverImage ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <BookOpen className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          <div className="flex-1 min-w-0 text-right">
            <Badge variant="secondary" className="text-[10px] mb-1">
              {categoryLabels[article.category] || article.category}
            </Badge>
            <h3 className="font-semibold text-sm line-clamp-2 text-right">{article.title}</h3>
            {article.excerpt && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 text-right">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center justify-end gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {toPersianNumber(article.readingTime || 5)} دقیقه
                <Clock className="h-3 w-3" />
              </span>
              <div className="flex items-center gap-1">
                <span>{article.author?.fullName}</span>
                <Avatar className="h-4 w-4">
                  <AvatarImage src={article.author?.avatar} />
                  <AvatarFallback className="text-[8px]">
                    {article.author?.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {toPersianNumber(article.viewCount || 0)}
                <Eye className="h-3 w-3" />
              </span>
              <span className="flex items-center gap-1">
                {toPersianNumber(article.likeCount || 0)}
                <Heart className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0">
      <div className="flex gap-3 p-3">
        <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </Card>
  );
}
