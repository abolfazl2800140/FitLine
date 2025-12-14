import { useState, useEffect, useRef, useCallback } from "react";
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
  WifiOff,
  Reply,
  X
} from "lucide-react";

interface ReplyTo {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  replyToId?: string | null;
  replyTo?: ReplyTo | null;
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
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    mutationFn: async ({ content, replyToId }: { content: string; replyToId?: string | null }) => {
      // Use WebSocket if connected, otherwise fallback to REST API
      if (isConnected && selectedConv?.participant?.id) {
        wsSendMessage({
          type: 'message',
          conversationId: selectedConversation,
          content,
          recipientId: selectedConv.participant.id,
          replyToId,
        });
        // Return a resolved promise for WebSocket
        return Promise.resolve({ success: true });
      }
      // Fallback to REST API only if WebSocket is not connected
      return apiRequest("POST", `/api/conversations/${selectedConversation}/messages`, { content, replyToId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setNewMessage("");
      setReplyingTo(null);
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
      sendMessageMutation.mutate({
        content: newMessage,
        replyToId: replyingTo?.id || null
      });
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-primary/10');
      setTimeout(() => element.classList.remove('bg-primary/10'), 2000);
    }
  };

  // Swipe to reply functionality
  const SwipeableMessage = useCallback(({
    msg,
    isOwn,
    onReply
  }: {
    msg: Message;
    isOwn: boolean;
    onReply: (msg: Message) => void;
  }) => {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const messageRef = useRef<HTMLDivElement>(null);

    const minSwipeDistance = 50;
    const maxSwipeDistance = 80;

    const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
      if (!touchStart) return;
      const currentTouch = e.targetTouches[0].clientX;
      const diff = touchStart - currentTouch;

      // For RTL: swipe left (positive diff) for own messages, swipe right (negative diff) for others
      if (isOwn && diff > 0) {
        setSwipeOffset(Math.min(diff, maxSwipeDistance));
      } else if (!isOwn && diff < 0) {
        setSwipeOffset(Math.max(diff, -maxSwipeDistance));
      }
      setTouchEnd(currentTouch);
    };

    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) {
        setSwipeOffset(0);
        return;
      }

      const distance = touchStart - touchEnd;
      const isValidSwipe = isOwn ? distance > minSwipeDistance : distance < -minSwipeDistance;

      if (isValidSwipe) {
        onReply(msg);
        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }

      setSwipeOffset(0);
      setTouchStart(null);
      setTouchEnd(null);
    };

    return (
      <div
        ref={messageRef}
        id={`message-${msg.id}`}
        className={cn(
          "flex gap-2 group transition-all duration-200 rounded-lg relative",
          isOwn ? "justify-start" : "justify-end"
        )}
        style={{
          transform: `translateX(${-swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Swipe indicator */}
        {Math.abs(swipeOffset) > 20 && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 transition-opacity",
              isOwn ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2"
            )}
            style={{ opacity: Math.abs(swipeOffset) / maxSwipeDistance }}
          >
            <Reply className="h-5 w-5 text-primary" />
          </div>
        )}

        {/* Reply button - shows on hover for own messages (left side) */}
        {isOwn && (
          <button
            onClick={() => onReply(msg)}
            className="opacity-0 group-hover:opacity-100 transition-opacity self-center p-1 hover:bg-muted rounded-full hidden md:block"
          >
            <Reply className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        <div
          className={cn(
            "max-w-[70%] rounded-2xl px-4 py-2",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          {/* Reply preview */}
          {msg.replyTo && (
            <div
              onClick={() => scrollToMessage(msg.replyTo!.id)}
              className={cn(
                "mb-2 p-2 rounded-lg cursor-pointer border-r-2",
                isOwn
                  ? "bg-primary-foreground/10 border-primary-foreground/50"
                  : "bg-background/50 border-primary/50"
              )}
            >
              <p className={cn(
                "text-xs font-medium",
                isOwn ? "text-primary-foreground/90" : "text-primary"
              )}>
                {msg.replyTo.senderId === currentUser?.id ? "شما" : msg.replyTo.senderName}
              </p>
              <p className={cn(
                "text-xs truncate",
                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {msg.replyTo.content.length > 50
                  ? msg.replyTo.content.substring(0, 50) + "..."
                  : msg.replyTo.content}
              </p>
            </div>
          )}

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

        {/* Reply button - shows on hover for other's messages (right side) */}
        {!isOwn && (
          <button
            onClick={() => onReply(msg)}
            className="opacity-0 group-hover:opacity-100 transition-opacity self-center p-1 hover:bg-muted rounded-full hidden md:block"
          >
            <Reply className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }, [currentUser?.id, scrollToMessage]);

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
          "md:col-span-2 h-full",
          !selectedConversation && "hidden md:flex"
        )}>
          {selectedConversation && selectedConv ? (
            <div className="fixed inset-0 flex flex-col bg-background z-30 h-[100dvh]">
              {/* Fixed Header */}
              <div className="flex-shrink-0 p-4 border-b bg-background">
                <div className="flex items-center gap-3 flex-row-reverse">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
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
                        <SwipeableMessage
                          key={msg.id}
                          msg={msg}
                          isOwn={isOwn}
                          onReply={handleReply}
                        />
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
              <div className="flex-shrink-0 border-t bg-background">
                {/* Reply Preview Bar */}
                {replyingTo && (
                  <div className="px-3 py-2 bg-muted/50 border-b flex items-center gap-3">
                    <div className="w-1 h-10 bg-primary rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-primary">
                        پاسخ به {replyingTo.senderId === currentUser?.id ? "خودتان" : selectedConv?.participant?.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {replyingTo.content}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={cancelReply}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="px-3 py-2">
                  <div className="relative flex items-center gap-2 mb-0">
                    <div className="relative flex-1">
                      <Input
                        ref={inputRef}
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
