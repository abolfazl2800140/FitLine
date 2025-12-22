import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { translations, formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { Search, MessageCircle } from "lucide-react";

interface Conversation {
  id: string;
  participant: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const ConversationList = memo(function ConversationList({
  conversations,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  isLoading,
  className,
}: ConversationListProps) {
  const filteredConversations = conversations.filter(conv => {
    if (!search) return true;
    return conv.participant?.fullName?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Card className={cn("border-0 shadow-none rounded-none border-l h-full flex flex-col", className)}>
      <CardHeader className="p-4 pb-2 border-b">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجوی مکالمه..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
            data-testid="input-search-conversations"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-10rem)]">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="h-10 w-10 rounded-full bg-muted skeleton-shimmer" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-muted skeleton-shimmer rounded mb-1" />
                    <div className="h-3 w-32 bg-muted skeleton-shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  className={cn(
                    "w-full flex flex-row-reverse items-center gap-3 p-4 transition-colors text-right border-b",
                    selectedId === conv.id ? "bg-accent" : "hover:bg-muted"
                  )}
                  onClick={() => onSelect(conv.id)}
                  data-testid={`conversation-${conv.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.participant?.avatar} />
                    <AvatarFallback>
                      {conv.participant?.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap" dir="rtl">
                        {conv.lastMessageAt && formatRelativeTime(conv.lastMessageAt)}
                      </span>
                      <p className="font-medium truncate text-right">
                        {conv.participant?.fullName}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate text-right mt-1">
                      {conv.lastMessage 
                        ? (conv.lastMessage.length > 30 ? conv.lastMessage.substring(0, 30) + "..." : conv.lastMessage) 
                        : "بدون پیام"}
                    </p>
                  </div>
                  {conv.unreadCount && conv.unreadCount > 0 && (
                    <Badge className="h-5 min-w-[20px] flex items-center justify-center p-0">
                      {toPersianNumber(conv.unreadCount)}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                {translations.messages.noMessages}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
