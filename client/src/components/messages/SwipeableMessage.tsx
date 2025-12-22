import { useState, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { formatRelativeTime, toPersianNumber } from "@/lib/persian";
import { Check, CheckCheck, Reply, Play, Pause } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Edit2, Trash2 } from "lucide-react";

const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

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
  replyTo?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
  } | null;
  reactions?: { emoji: string; userId: string; userName: string }[];
}

interface SwipeableMessageProps {
  msg: Message;
  isOwn: boolean;
  currentUserId?: string;
  onReply: (msg: Message) => void;
  onEdit?: (msg: Message) => void;
  onDelete?: (messageId: string) => void;
  onCopy?: (text: string) => void;
  onToggleReaction?: (messageId: string, emoji: string, hasReacted: boolean) => void;
  onScrollToMessage?: (messageId: string) => void;
  playingVoice?: string | null;
  onPlayVoice?: (url: string, messageId: string) => void;
  formatDuration?: (seconds: number) => string;
}

export const SwipeableMessage = memo(function SwipeableMessage({
  msg,
  isOwn,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onToggleReaction,
  onScrollToMessage,
  playingVoice,
  onPlayVoice,
  formatDuration = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`,
}: SwipeableMessageProps) {
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
      if (navigator.vibrate) navigator.vibrate(50);
    }

    setSwipeOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const userReactions = msg.reactions?.filter(r => r.userId === currentUserId) || [];
  const groupedReactions = msg.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

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

      <div className="flex flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "max-w-[100%] rounded-2xl px-4 py-2 relative cursor-pointer",
                isOwn
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted rounded-bl-sm",
                msg.isDeleted && "opacity-60 italic"
              )}
            >
              {/* Reply preview */}
              {msg.replyTo && (
                <div
                  onClick={(e) => { e.stopPropagation(); onScrollToMessage?.(msg.replyTo!.id); }}
                  className={cn(
                    "mb-2 p-2 rounded-lg cursor-pointer border-r-2",
                    isOwn
                      ? "bg-primary-foreground/10 border-primary-foreground/50"
                      : "bg-background/50 border-primary/50"
                  )}
                >
                  <p className={cn("text-xs font-medium", isOwn ? "text-primary-foreground/90" : "text-primary")}>
                    {msg.replyTo.senderId === currentUserId ? "شما" : msg.replyTo.senderName}
                  </p>
                  <p className={cn("text-xs truncate", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {msg.replyTo.content.length > 50 ? msg.replyTo.content.substring(0, 50) + "..." : msg.replyTo.content}
                  </p>
                </div>
              )}

              {/* Voice message */}
              {msg.messageType === 'voice' && msg.voiceUrl ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onPlayVoice?.(msg.voiceUrl!, msg.id)}
                    className={cn(
                      "h-11 w-11 rounded-full flex items-center justify-center",
                      isOwn ? "bg-primary-foreground/20" : "bg-primary/20"
                    )}
                  >
                    {playingVoice === msg.id ? (
                      <Pause className={cn("h-5 w-5", isOwn ? "text-primary-foreground" : "text-primary")} />
                    ) : (
                      <Play className={cn("h-5 w-5", isOwn ? "text-primary-foreground" : "text-primary")} />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className={cn("h-1 rounded-full", isOwn ? "bg-primary-foreground/30" : "bg-primary/30")} />
                    <span className={cn("text-xs", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {formatDuration(msg.voiceDuration || 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}

              <div className={cn("flex items-center gap-1 mt-1", isOwn ? "justify-start" : "justify-end")}>
                {msg.isEdited && <span className={cn("text-[10px]", isOwn ? "text-primary-foreground/50" : "text-muted-foreground/50")}>ویرایش شده</span>}
                <span className={cn("text-[10px]", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {formatRelativeTime(msg.createdAt)}
                </span>
                {isOwn && (
                  msg.isRead
                    ? <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                    : <Check className="h-3 w-3 text-primary-foreground/70" />
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwn ? "start" : "end"} className="min-w-[140px]">
            <DropdownMenuItem onClick={() => onReply(msg)}>
              <Reply className="h-4 w-4 ml-2" /> پاسخ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopy?.(msg.content)}>
              <Copy className="h-4 w-4 ml-2" /> کپی
            </DropdownMenuItem>
            {isOwn && msg.messageType === 'text' && (
              <DropdownMenuItem onClick={() => onEdit?.(msg)}>
                <Edit2 className="h-4 w-4 ml-2" /> ویرایش
              </DropdownMenuItem>
            )}
            {isOwn && (
              <DropdownMenuItem onClick={() => onDelete?.(msg.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 ml-2" /> حذف
              </DropdownMenuItem>
            )}
            <div className="px-2 py-1.5 border-t mt-1">
              <div className="flex gap-1 justify-center">
                {REACTION_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => onToggleReaction?.(msg.id, emoji, userReactions.some(r => r.emoji === emoji))}
                    className="hover:scale-125 transition-transform text-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reactions display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={cn("flex gap-1 mt-1", isOwn ? "justify-start" : "justify-end")}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onToggleReaction?.(msg.id, emoji, userReactions.some(r => r.emoji === emoji))}
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full border",
                  userReactions.some(r => r.emoji === emoji) ? "bg-primary/10 border-primary" : "bg-muted border-border"
                )}
              >
                {emoji} {count > 1 && toPersianNumber(count)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
