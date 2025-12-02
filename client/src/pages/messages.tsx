import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { translations, formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Send, 
  MessageCircle, 
  ArrowRight,
  Check,
  CheckCheck,
  Loader2
} from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

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

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/conversations/${selectedConversation}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setNewMessage("");
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConv = conversations?.find(c => c.id === selectedConversation);
  const filteredConversations = conversations?.filter(conv => {
    if (!search) return true;
    return conv.participant?.fullName?.toLowerCase().includes(search.toLowerCase());
  }) || [];

  if (!currentUser) {
    return (
      <div className="container max-w-4xl px-4 md:px-6 py-6">
        <Card className="text-center py-16">
          <CardContent>
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">ابتدا وارد شوید</h3>
            <p className="text-muted-foreground mb-4">
              برای مشاهده پیام‌ها ابتدا وارد حساب کاربری شوید
            </p>
            <Button>{translations.auth.login}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{translations.messages.title}</h1>
        <p className="text-muted-foreground">
          با مربیان و کاربران دیگر ارتباط برقرار کنید
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-16rem)]">
        <Card className={cn(
          "md:col-span-1",
          selectedConversation && "hidden md:block"
        )}>
          <CardHeader className="p-4 pb-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی مکالمه..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
                data-testid="input-search-conversations"
              />
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[calc(100vh-22rem)]">
              {conversationsLoading ? (
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
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-right",
                        selectedConversation === conv.id 
                          ? "bg-accent" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => setSelectedConversation(conv.id)}
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
                          <p className="font-medium truncate">
                            {conv.participant?.fullName}
                          </p>
                          {conv.lastMessageAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage || "بدون پیام"}
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

        <Card className={cn(
          "md:col-span-2 flex flex-col",
          !selectedConversation && "hidden md:flex"
        )}>
          {selectedConversation && selectedConv ? (
            <>
              <CardHeader className="p-4 border-b flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConv.participant?.avatar} />
                    <AvatarFallback>
                      {selectedConv.participant?.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {selectedConv.participant?.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {translations.messages.online}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pb-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages && messages.length > 0 ? (
                      messages.map((msg) => {
                        const isOwn = msg.senderId === currentUser?.id;
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex gap-2",
                              isOwn ? "justify-start" : "justify-end"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-2xl px-4 py-2",
                                isOwn 
                                  ? "bg-primary text-primary-foreground rounded-br-sm" 
                                  : "bg-muted rounded-bl-sm"
                              )}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <div className={cn(
                                "flex items-center gap-1 mt-1",
                                isOwn ? "justify-start" : "justify-end"
                              )}>
                                <span className={cn(
                                  "text-[10px]",
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                  {formatRelativeTime(msg.createdAt)}
                                </span>
                                {isOwn && (
                                  msg.isRead 
                                    ? <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                                    : <Check className="h-3 w-3 text-primary-foreground/70" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">
                          شروع مکالمه
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="p-4 border-t flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={translations.messages.typeMessage}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    data-testid="input-message"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 rtl-flip" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">مکالمه‌ای را انتخاب کنید</h3>
                <p className="text-muted-foreground">
                  یک مکالمه از لیست انتخاب کنید تا پیام‌ها نمایش داده شوند
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
