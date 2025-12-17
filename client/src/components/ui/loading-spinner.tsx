import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    variant?: 'default' | 'dots' | 'pulse';
}

const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
};

/**
 * Modern loading spinner using Lucide's Loader2 icon
 * Consistent with shadcn/ui design system
 */
export function LoadingSpinner({
    size = 'md',
    className,
    variant = 'default'
}: LoadingSpinnerProps) {
    if (variant === 'dots') {
        return <LoadingDots className={className} size={size} />;
    }

    if (variant === 'pulse') {
        return <LoadingPulse className={className} size={size} />;
    }

    return (
        <Loader2 
            className={cn(
                "animate-spin text-primary",
                sizeMap[size],
                className
            )}
        />
    );
}

/**
 * Three dots loading indicator
 */
export function LoadingDots({ 
    className,
    size = 'md'
}: { 
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}) {
    const dotSizeMap = {
        xs: 'w-1 h-1',
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
        xl: 'w-3 h-3',
    };

    return (
        <div className={cn("flex items-center justify-center gap-1", className)}>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className={cn(
                        "bg-primary rounded-full animate-bounce",
                        dotSizeMap[size]
                    )}
                    style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '0.6s',
                    }}
                />
            ))}
        </div>
    );
}

/**
 * Pulsing circle loading indicator
 */
export function LoadingPulse({ 
    className,
    size = 'md'
}: { 
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}) {
    return (
        <div className={cn("relative", sizeMap[size], className)}>
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-primary/60 animate-pulse" />
        </div>
    );
}

/**
 * Full screen loading overlay
 */
export function LoadingOverlay({
    message,
    transparent = false
}: {
    message?: string;
    transparent?: boolean;
}) {
    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4",
                transparent
                    ? "bg-background/60 backdrop-blur-sm"
                    : "bg-background"
            )}
        >
            <LoadingSpinner size="xl" />
            {message && (
                <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
            )}
        </div>
    );
}

/**
 * Page loading component - centered spinner for page transitions
 */
export function PageLoader({ message }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <LoadingSpinner size="lg" />
            {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
            )}
        </div>
    );
}

/**
 * Inline loading state for buttons
 */
export function ButtonLoading({ className }: { className?: string }) {
    return <LoadingSpinner size="sm" className={cn("text-current", className)} />;
}
