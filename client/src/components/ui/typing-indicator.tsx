import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
  text?: string;
}

export function TypingIndicator({ className, text = "در حال نوشتن" }: TypingIndicatorProps) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span>{text}</span>
      <span className="flex gap-[2px] mr-0.5">
        <span className="w-[4px] h-[4px] rounded-full bg-current animate-typing-dot-1" />
        <span className="w-[4px] h-[4px] rounded-full bg-current animate-typing-dot-2" />
        <span className="w-[4px] h-[4px] rounded-full bg-current animate-typing-dot-3" />
      </span>
    </span>
  );
}

// Bubble style like Telegram
export function TypingBubble({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 px-3 py-2 rounded-2xl bg-muted/50 w-fit", className)}>
      <div className="flex gap-[3px]">
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 animate-typing-dot-1" />
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 animate-typing-dot-2" />
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 animate-typing-dot-3" />
      </div>
    </div>
  );
}
