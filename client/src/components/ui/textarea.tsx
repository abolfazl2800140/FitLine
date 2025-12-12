import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // iOS-like (no border, just background)
        "flex min-h-[80px] w-full rounded-xl border-0 bg-muted/60 px-4 py-3 text-base text-right",
        "transition-all duration-200 ease-out",
        "placeholder:text-muted-foreground/50 placeholder:text-right",
        // Focus - subtle background change
        "focus:outline-none focus:bg-muted focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      dir="rtl"
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
