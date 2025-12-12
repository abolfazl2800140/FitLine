import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { translations, formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/use-websocket";
import {
  Search,
  Send,
  MessageCircle,
  ArrowRight,
  Check,
  CheckCheck,
  Loader2,
  Wifi,
  WifiOff
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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isConnected, sendMessage: wsSendMessage, subscribe } = useWebSocket();

  // Hide/show bottom nav based on chat selection
  useEffect(() => {
    if (selectedConversation) {
      document.body.classList.add('hide-bottom-nav');
    } else {
      document.body.classList.remove('hide-bottom-nav');
    }
    return () => {
      document.body.classList.remove('hide-bottom-nav');
    };
  }, [selectedConversation]);

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

  // Subscribe to typing indicator
  useEffect(() => {
    const unsubTyping = subscribe('user_typing', (msg) => {
      if (msg.conversationId === selectedConversation) {
        setIsTyping(true);
      }
    });
    const unsubStopTyping = subscribe('user_stop_typing', (msg) => {
      if (msg.conversationId === selectedConversation) {
        setIsTyping(false);
      }
    });
    return () => {
      unsubTyping();
      unsubStopTyping();
    };
  }, [subscribe, selectedConversation]);

  const selectedConv = conversations?.find(c => c.id === selectedConversation);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Try WebSocket first for faster delivery
      if (isConnected && selectedConv?.participant?.id) {
        wsSendMessage({
          type: 'message',
          conversationId: selectedConversation,
          content,
          recipientId: selectedConv.participant.id,
        });
      }
      // Also send via REST API as backup
      return apiRequest("POST", `/api/conversations/${selectedConversation}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setNewMessage("");
    },
  });

  // Handle typing indicator
  const handleTyping = () => {
    if (selectedConv?.participant?.id && isConnected) {
      wsSendMessage({
        type: 'typing',
        conversationId: selectedConversation,
        recipientId: selectedConv.participant.id,
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        wsSendMessage({
          type: 'stop_typing',
          conversationId: selectedConversation,
          recipientId: selectedConv.participant.id,
        });
      }, 2000);
    }
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const filteredConversations = conversations?.filter(conv => {
    if (!search) return true;
    return conv.participant?.fullName?.toLowerCase().includes(search.toLowerCase());
  }) || [];

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">ابتدا وارد شوید</h3>
          <p className="text-muted-foreground mb-4">
            برای مشاهده پیام‌ها ابتدا وارد حساب کاربری شوید
          </p>
          <Button>{translations.auth.login}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
        <Card className={cn(
          "md:col-span-1 border-0 shadow-none rounded-none border-l h-full flex flex-col",
          selectedConversation && "hidden md:flex",
          !selectedConversation && "pb-16"
        )}>
          <CardHeader className="p-4 pb-2 border-b">
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
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-10rem)]">
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
                        "w-full flex items-center gap-3 p-4 transition-colors text-right border-b",
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

        <div className={cn(
          "md:col-span-2 flex flex-col h-full",
          !selectedConversation && "hidden md:flex"
        )}>
          {selectedConversation && selectedConv ? (
            <div className="flex flex-col h-full">
              {/* Fixed Header */}
              <div className="flex-shrink-0 p-4 border-b bg-background">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-1 text-xs">
                    {isConnected ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold">
                      {selectedConv.participant?.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isTyping ? "در حال نوشتن..." : translations.messages.online}
                    </p>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConv.participant?.avatar} />
                    <AvatarFallback>
                      {selectedConv.participant?.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Scrollable Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
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
              </div>

              {/* Fixed Input */}
              <div className="flex-shrink-0 px-3 pt-2 pb-[env(safe-area-inset-bottom,0)] border-t bg-background">
                <div className="relative flex items-center gap-2 mb-0">
                  <div className="relative flex-1">
                    <Input
                      placeholder={translations.messages.typeMessage}
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="pr-4 pl-12 py-5 rounded-3xl border-2 focus-visible:ring-0 focus-visible:border-primary"
                      data-testid="input-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                      size="icon"
                      className={cn(
                        "absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full transition-all",
                        newMessage.trim()
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-muted hover:bg-muted"
                      )}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className={cn(
                          "h-5 w-5",
                          newMessage.trim() ? "text-white" : "text-muted-foreground"
                        )} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
        </div>
      </div>
    </div >
  );
}
