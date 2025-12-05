import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/hooks/useHaptic";

interface SegmentedControlProps<T extends string> {
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    className,
    size = 'md',
}: SegmentedControlProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, x: 0 });

    const sizeClasses = {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const activeIndex = options.findIndex(opt => opt.value === value);
        const buttons = container.querySelectorAll('button');
        const activeButton = buttons[activeIndex];

        if (activeButton) {
            const containerRect = container.getBoundingClientRect();
            const buttonRect = activeButton.getBoundingClientRect();

            setIndicatorStyle({
                width: buttonRect.width - 4,
                x: buttonRect.left - containerRect.left + 2,
            });
        }
    }, [value, options]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative inline-flex items-center bg-muted/80 rounded-xl p-1",
                sizeClasses[size],
                className
            )}
        >
            {/* Animated indicator */}
            <motion.div
                className="absolute top-1 bottom-1 bg-card rounded-lg shadow-sm"
                initial={false}
                animate={{
                    width: indicatorStyle.width,
                    x: indicatorStyle.x,
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                }}
            />

            {/* Options */}
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => {
                        if (option.value !== value) {
                            triggerHaptic('selection');
                            onChange(option.value);
                        }
                    }}
                    className={cn(
                        "relative z-10 flex-1 px-4 font-medium transition-colors duration-200",
                        option.value === value
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground/80"
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}