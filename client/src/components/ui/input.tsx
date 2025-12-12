import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            // Base styles - iOS-like (no border, just background)
            "flex h-12 w-full rounded-xl border-0 bg-muted/60 px-4 py-3 text-base text-right",
            "transition-all duration-200 ease-out",
            // Focus - subtle background change
            "focus:outline-none focus:bg-muted focus:ring-0",
            // Placeholder
            "placeholder:text-muted-foreground/50 placeholder:text-right",
            // File input
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Error state
            error && "bg-destructive/10 focus:bg-destructive/10",
            // Icon padding
            icon && "pr-10",
            // Allow text selection
            "select-text",
            className
          )}
          dir="rtl"
          ref={ref}
          // Prevent zoom on iOS
          style={{ fontSize: '16px' }}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

// Search input variant
const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        type="search"
        className={cn(
          "h-10 rounded-full bg-muted/80 border-0 pr-10",
          "focus-visible:bg-background focus-visible:ring-1",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

export { Input, SearchInput }
