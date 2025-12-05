import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

// Haptic feedback
const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, ...props }, ref) => {
  const handleChange = (checked: boolean) => {
    triggerHaptic();
    onCheckedChange?.(checked);
  };

  return (
    <SwitchPrimitives.Root
      dir="ltr"
      className={cn(
        // Compact switch styling
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        "border-2 border-transparent transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Colors
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        // Active state
        "active:scale-[0.97]",
        className
      )}
      onCheckedChange={handleChange}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          // Compact thumb
          "pointer-events-none block h-5 w-5 rounded-full bg-white",
          "shadow-[0_2px_4px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.1)]",
          "ring-0 transition-all duration-200 ease-out",
          // Position
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  );
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
