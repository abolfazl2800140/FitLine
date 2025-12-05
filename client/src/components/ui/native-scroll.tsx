import { ReactNode, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NativeScrollProps {
    children: ReactNode;
    className?: string;
    horizontal?: boolean;
    hideScrollbar?: boolean;
    snapToItems?: boolean;
    onScrollEnd?: () => void;
}

/**
 * Native-like scroll container with momentum scrolling
 * and optional snap behavior
 */
export function NativeScroll({
    children,
    className,
    horizontal = false,
    hideScrollbar = true,
    snapToItems = false,
    onScrollEnd,
}: NativeScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollTimeout = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const element = scrollRef.current;
        if (!element || !onScrollEnd) return;

        const handleScroll = () => {
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
            scrollTimeout.current = setTimeout(() => {
                onScrollEnd();
            }, 150);
        };

        element.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            element.removeEventListener('scroll', handleScroll);
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, [onScrollEnd]);

    return (
        <div
            ref={scrollRef}
            className={cn(
                // Base styles
                "overflow-auto overscroll-contain",
                // Momentum scrolling for iOS
                "-webkit-overflow-scrolling-touch",
                // Direction
                horizontal ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto overflow-x-hidden",
                // Hide scrollbar
                hideScrollbar && "scrollbar-hide",
                // Snap behavior
                snapToItems && (horizontal ? "snap-x snap-mandatory" : "snap-y snap-mandatory"),
                className
            )}
            style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: hideScrollbar ? 'none' : 'auto',
                msOverflowStyle: hideScrollbar ? 'none' : 'auto',
            }}
        >
            {children}
        </div>
    );
}

// Snap item wrapper
export function SnapItem({
    children,
    className,
    align = 'start'
}: {
    children: ReactNode;
    className?: string;
    align?: 'start' | 'center' | 'end';
}) {
    const alignClass = {
        start: 'snap-start',
        center: 'snap-center',
        end: 'snap-end',
    };

    return (
        <div className={cn(alignClass[align], className)}>
            {children}
        </div>
    );
}