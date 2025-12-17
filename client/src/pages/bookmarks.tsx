import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronRight, Bookmark, FileText, Dumbbell, Newspaper, HelpCircle,
  Heart, Eye, MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianNumber, formatRelativeTime } from "@/lib/persian";

type TabType = "articles" | "tutorials" | "posts" | "questions";

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "articles", label: "مقالات", icon: <FileText className="h-4 w-4" /> },
  { id: "tutorials", label: "آموزش‌ها", icon: <Dumbbell className="h-4 w-4" /> },
  { id: "posts", label: "فید", icon: <Newspaper className="h-4 w-4" /> },
  { id: "questions", label: "انجمن", icon: <HelpCircle className="h-4 w-4" /> },
];

export default function BookmarksPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("articles");

  const { data: bookmarks, isLoading } = useQuery<any[]>({
    queryKey: ["/api/bookmarks"],
  });

  const filteredBookmarks = bookmarks?.filter(b => {
    if (activeTab === "articles") return b.itemType === "article";
    if (activeTab === "tutorials") return b.itemType === "tutorial";
    if (activeTab === "posts") return b.itemType === "post";
    if (activeTab === "questions") return b.itemType === "question";
    return false;
  }) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => window.history.back()}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            <span className="font-bold">ذخیره‌شده‌ها</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredBookmarks.length > 0 ? (
          <div className="space-y-3">
            {filteredBookmarks.map((bookmark) => (
              <BookmarkItem
                key={bookmark.id}
                bookmark={bookmark}
                onNavigate={setLocation}
              />
            ))}
          </div>
        ) : (
          <EmptyState type={activeTab} />
        )}
      </div>
    </div>
  );
}


function BookmarkItem({ bookmark, onNavigate }: { bookmark: any; onNavigate: (path: string) => void }) {
  const item = bookmark.item;
  
  const getRoute = () => {
    switch (bookmark.itemType) {
      case "article": return `/learn/article/${bookmark.itemId}`;
      case "tutorial": return `/learn/tutorial/${bookmark.itemId}`;
      case "post": return `/post/${bookmark.itemId}`;
      case "question": return `/community/question/${bookmark.itemId}`;
      default: return "/";
    }
  };

  const getIcon = () => {
    switch (bookmark.itemType) {
      case "article": return <FileText className="h-5 w-5 text-blue-500" />;
      case "tutorial": return <Dumbbell className="h-5 w-5 text-green-500" />;
      case "post": return <Newspaper className="h-5 w-5 text-orange-500" />;
      case "question": return <HelpCircle className="h-5 w-5 text-purple-500" />;
      default: return <Bookmark className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    if (!item) return "آیتم حذف شده";
    switch (bookmark.itemType) {
      case "article": return item.title;
      case "tutorial": return item.name;
      case "post": return item.content?.substring(0, 60) + (item.content?.length > 60 ? "..." : "");
      case "question": return item.title;
      default: return "";
    }
  };

  const getStats = () => {
    if (!item) return null;
    switch (bookmark.itemType) {
      case "article":
      case "tutorial":
        return (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {toPersianNumber(item.likeCount || 0)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {toPersianNumber(item.viewCount || 0)}
            </span>
          </div>
        );
      case "post":
        return (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {toPersianNumber(item.likeCount || 0)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> {toPersianNumber(item.commentCount || 0)}
            </span>
          </div>
        );
      case "question":
        return (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{toPersianNumber(item.voteCount || 0)} رأی</span>
            <span>{toPersianNumber(item.answerCount || 0)} پاسخ</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getAuthor = () => {
    if (!item) return null;
    const author = item.author || item.coach || item.user;
    if (!author) return null;
    return (
      <div className="flex items-center gap-2 mt-2">
        <Avatar className="h-5 w-5">
          <AvatarImage src={author.avatar} />
          <AvatarFallback className="text-[10px]">{author.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">{author.fullName}</span>
      </div>
    );
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onNavigate(getRoute())}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-2 mb-1">{getTitle()}</p>
            {getStats()}
            {getAuthor()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type }: { type: TabType }) {
  const messages: Record<TabType, { title: string; desc: string }> = {
    articles: { title: "مقاله‌ای ذخیره نشده", desc: "مقالات مورد علاقه‌تان را ذخیره کنید" },
    tutorials: { title: "آموزشی ذخیره نشده", desc: "آموزش‌های مفید را ذخیره کنید" },
    posts: { title: "پستی ذخیره نشده", desc: "پست‌های جالب را ذخیره کنید" },
    questions: { title: "سوالی ذخیره نشده", desc: "سوالات مفید انجمن را ذخیره کنید" },
  };

  return (
    <div className="text-center py-16">
      <Bookmark className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="font-semibold text-lg mb-2">{messages[type].title}</h3>
      <p className="text-sm text-muted-foreground">{messages[type].desc}</p>
    </div>
  );
}
