import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { translations } from "@/lib/persian";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/use-websocket";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useToast } from "@/hooks/use-toast";
import { SwipeableMessage, ConversationList, MessageInput } from "@/components/messages";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageCircle, ArrowRight, Wifi, WifiOff, Loader2 } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  content: string;
  messageType?: 'text' | 'voice' | 'image' | 'file';
  voiceUrl?: string;
  voiceDuration?: number;
  createdAt: string;
  isRead: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  replyToId?: string | null;
  replyTo?: { id: string; content: string; senderId: string; senderName: string } | null;
  reactions?: { emoji: string; userId: string; userName: string }[];
}

interface Conversation {
  id: string;
  participant: { id: string; fullName: string; avatar?: string };
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
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState("");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isConnected, sendMessage: wsSendMessage, subscribe } = useWebSocket();

  // Queries
  const { data: currentUser } = useQuery<any>({ queryKey: ["/api/auth/me"] });
  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const selectedConv = conversations?.find(c => c.id === selectedConversation);

  // Voice recording
  const sendVoiceMutation = useMutation({
    mutationFn: async ({ blob, duration }: { blob: Blob; duration: number }) => {
      const formData = new FormData();
      formData.append('voice', blob, 'voice.webm');
      formData.append('conversationId', selectedConversation!);
      formData.append('duration', duration.toString());
      if (replyingTo) formData.append('replyToId', replyingTo.id);
      const res = await fetch('/api/messages/voice', { method: 'POST', body: formData, credentials: 'include' });
      if (!res.ok) throw new Error('خطا در ارسال پیام صوتی');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setReplyingTo(null);
      toast({ title: "پیام صوتی ارسال شد" });
    },
    onError: () => toast({ title: "خطا در ارسال پیام صوتی", variant: "destructive" }),
  });

  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording, formatDuration } = useVoiceRecording({
    onRecordingComplete: (blob, duration) => sendVoiceMutation.mutate({ blob, duration }),
  });

  // Hide bottom nav when chat is open
  useEffect(() => {
    if (selectedConversation) document.body.classList.add('hide-bottom-nav');
    else document.body.classList.remove('hide-bottom-nav');
    return () => document.body.classList.remove('hide-bottom-nav');
  }, [selectedConversation]);

  // Subscribe to typing
  useEffect(() => {
    const unsubTyping = subscribe('user_typing', (msg) => {
      if (msg.conversationId === selectedConversation) setIsTyping(true);
    });
    const unsubStopTyping = subscribe('user_stop_typing', (msg) => {
      if (msg.conversationId === selectedConversation) setIsTyping(false);
    });
    return () => { unsubTyping(); unsubStopTyping(); };
  }, [subscribe, selectedConversation]);

  // Mark as read
  useEffect(() => {
    if (selectedConversation) {
      apiRequest("POST", `/api/conversations/${selectedConversation}/read`).catch(() => {});
    }
  }, [selectedConversation, messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, replyToId }: { content: string; replyToId?: string | null }) => {
      if (isConnected && selectedConv?.participant?.id) {
        wsSendMessage({ type: 'message', conversationId: selectedConversation, content, recipientId: selectedConv.participant.id, replyToId });
        return Promise.resolve({ success: true });
      }
      return apiRequest("POST", `/api/conversations/${selectedConversation}/messages`, { content, replyToId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setNewMessage("");
      setReplyingTo(null);
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => 
      apiRequest("PATCH", `/api/messages/${messageId}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      setEditingMessage(null);
      setEditContent("");
      toast({ title: "پیام ویرایش شد" });
    },
    onError: () => toast({ title: "خطا در ویرایش پیام", variant: "destructive" }),
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => apiRequest("DELETE", `/api/messages/${messageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      toast({ title: "پیام حذف شد" });
    },
    onError: () => toast({ title: "خطا در حذف پیام", variant: "destructive" }),
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const res = await apiRequest("POST", `/api/messages/${messageId}/reactions`, { emoji });
      return res.json();
    },
    onMutate: async ({ messageId, emoji }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      const previousMessages = queryClient.getQueryData<Message[]>(["/api/conversations", selectedConversation, "messages"]);
      queryClient.setQueryData<Message[]>(["/api/conversations", selectedConversation, "messages"], (old) => {
        if (!old) return old;
        return old.map(msg => {
          if (msg.id === messageId) {
            const filteredReactions = (msg.reactions || []).filter(r => r.userId !== currentUser?.id);
            return { ...msg, reactions: [...filteredReactions, { emoji, userId: currentUser?.id || '', userName: currentUser?.fullName || '' }] };
          }
          return msg;
        });
      });
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) queryClient.setQueryData(["/api/conversations", selectedConversation, "messages"], context.previousMessages);
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const res = await apiRequest("DELETE", `/api/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
      return res.json();
    },
    onMutate: async ({ messageId, emoji }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      const previousMessages = queryClient.getQueryData<Message[]>(["/api/conversations", selectedConversation, "messages"]);
      queryClient.setQueryData<Message[]>(["/api/conversations", selectedConversation, "messages"], (old) => {
        if (!old) return old;
        return old.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, reactions: (msg.reactions || []).filter(r => !(r.emoji === emoji && r.userId === currentUser?.id)) };
          }
          return msg;
        });
      });
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) queryClient.setQueryData(["/api/conversations", selectedConversation, "messages"], context.previousMessages);
    },
  });

  // Handlers
  const handleTyping = () => {
    if (selectedConv?.participant?.id && isConnected) {
      wsSendMessage({ type: 'typing', conversationId: selectedConversation, recipientId: selectedConv.participant.id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        wsSendMessage({ type: 'stop_typing', conversationId: selectedConversation, recipientId: selectedConv.participant.id });
      }, 2000);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate({ content: newMessage, replyToId: replyingTo?.id || null });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleInputChange = (value: string) => { setNewMessage(value); handleTyping(); };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-primary/10');
      setTimeout(() => element.classList.remove('bg-primary/10'), 2000);
    }
  };

  const playVoice = (url: string, messageId: string) => {
    if (audioRef.current) audioRef.current.pause();
    if (playingVoice === messageId) { setPlayingVoice(null); return; }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setPlayingVoice(messageId);
    audio.onended = () => setPlayingVoice(null);
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "کپی شد" }); };

  const toggleReaction = (messageId: string, emoji: string, hasReacted: boolean) => {
    if (hasReacted) removeReactionMutation.mutate({ messageId, emoji });
    else addReactionMutation.mutate({ messageId, emoji });
  };

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">ابتدا وارد شوید</h3>
          <p className="text-muted-foreground mb-4">برای مشاهده پیام‌ها ابتدا وارد حساب کاربری شوید</p>
          <Button className="min-h-[44px]" onClick={() => window.location.href = '/auth'}>{translations.auth.login}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
        <ConversationList
          conversations={conversations || []}
          selectedId={selectedConversation}
          search={search}
          onSearchChange={setSearch}
          onSelect={setSelectedConversation}
          isLoading={conversationsLoading}
          className={cn(
            "md:col-span-1",
            selectedConversation && "hidden md:flex",
            !selectedConversation && "pb-16"
          )}
        />

        <div className={cn("md:col-span-2 h-full", !selectedConversation && "hidden md:flex")}>
          {selectedConversation && selectedConv ? (
            <div className="fixed inset-0 flex flex-col bg-background z-30 h-[100dvh]">
              {/* Header */}
              <div className="flex-shrink-0 p-4 border-b bg-background">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className="flex items-center gap-1 text-xs">
                    {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold">{selectedConv.participant?.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {isTyping ? <TypingIndicator className="text-primary" /> : translations.messages.online}
                    </p>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConv.participant?.avatar} />
                    <AvatarFallback>{selectedConv.participant?.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((msg) => (
                      <SwipeableMessage
                        key={msg.id}
                        msg={msg}
                        isOwn={msg.senderId === currentUser?.id}
                        currentUserId={currentUser?.id}
                        onReply={setReplyingTo}
                        onEdit={(m) => { setEditingMessage(m); setEditContent(m.content); }}
                        onDelete={(id) => deleteMessageMutation.mutate(id)}
                        onCopy={copyToClipboard}
                        onToggleReaction={toggleReaction}
                        onScrollToMessage={scrollToMessage}
                        playingVoice={playingVoice}
                        onPlayVoice={playVoice}
                        formatDuration={formatDuration}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">شروع مکالمه</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <MessageInput
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                currentUserId={currentUser?.id}
                participantName={selectedConv?.participant?.fullName}
                isSending={sendMessageMutation.isPending}
                isRecording={isRecording}
                recordingTime={recordingTime}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onCancelRecording={cancelRecording}
                isVoiceSending={sendVoiceMutation.isPending}
                formatDuration={formatDuration}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">مکالمه‌ای را انتخاب کنید</h3>
                <p className="text-muted-foreground">یک مکالمه از لیست انتخاب کنید تا پیام‌ها نمایش داده شوند</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMessage} onOpenChange={() => setEditingMessage(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>ویرایش پیام</DialogTitle></DialogHeader>
          <div className="py-4">
            <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="متن پیام..." className="text-right" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingMessage(null)}>انصراف</Button>
            <Button onClick={() => editingMessage && editMessageMutation.mutate({ messageId: editingMessage.id, content: editContent })} disabled={editMessageMutation.isPending || !editContent.trim()}>
              {editMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
