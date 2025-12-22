import { memo, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { translations } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { Send, Mic, X, Loader2 } from "lucide-react";

interface ReplyTo {
  id: string;
  content: string;
  senderId: string;
}

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  replyingTo: ReplyTo | null;
  onCancelReply: () => void;
  currentUserId?: string;
  participantName?: string;
  isSending?: boolean;
  // Voice recording
  isRecording?: boolean;
  recordingTime?: number;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onCancelRecording?: () => void;
  isVoiceSending?: boolean;
  formatDuration?: (seconds: number) => string;
}

export const MessageInput = memo(forwardRef<HTMLInputElement, MessageInputProps>(function MessageInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  replyingTo,
  onCancelReply,
  currentUserId,
  participantName,
  isSending,
  isRecording,
  recordingTime = 0,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  isVoiceSending,
  formatDuration = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`,
}, ref) {
  return (
    <div className="flex-shrink-0 border-t bg-background">
      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="px-3 py-2 bg-muted/50 border-b flex items-center gap-3">
          <div className="w-1 h-10 bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">
              پاسخ به {replyingTo.senderId === currentUserId ? "خودتان" : participantName}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {replyingTo.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="px-3 py-2">
        {isRecording ? (
          /* Recording UI */
          <div className="flex items-center gap-3 bg-destructive/10 rounded-3xl px-4 py-3">
            <div className="flex-1 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-destructive font-medium">{formatDuration(recordingTime)}</span>
              <span className="text-sm text-muted-foreground">در حال ضبط...</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancelRecording}
              className="h-10 w-10 rounded-full text-muted-foreground hover:text-destructive"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              onClick={onStopRecording}
              className="h-10 w-10 rounded-full bg-primary"
              disabled={isVoiceSending}
            >
              {isVoiceSending ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Send className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        ) : (
          /* Normal input UI */
          <div className="relative flex items-center gap-2 mb-0">
            {/* Voice record button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onStartRecording}
              className="h-10 w-10 rounded-full shrink-0"
            >
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="relative flex-1">
              <Input
                ref={ref}
                placeholder={translations.messages.typeMessage}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={onKeyPress}
                className="pr-4 pl-12 py-5 rounded-3xl border-2 focus-visible:ring-0 focus-visible:border-primary"
                data-testid="input-message"
              />
              <Button
                onClick={onSend}
                disabled={!value.trim() || isSending}
                data-testid="button-send-message"
                size="icon"
                className={cn(
                  "absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full transition-all",
                  value.trim()
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-muted hover:bg-muted"
                )}
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className={cn(
                    "h-5 w-5",
                    value.trim() ? "text-white" : "text-muted-foreground"
                  )} />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}));
