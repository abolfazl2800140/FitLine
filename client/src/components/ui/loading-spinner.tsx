import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    color?: 'primary' | 'white' | 'muted';
}

/**
 * iOS-style activity indicator
 */
export function LoadingSpinner({
    size = 'md',
    className,
    color = 'primary'
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const colorClasses = {
        primary: 'text-primary',
        white: 'text-white',
        muted: 'text-muted-foreground',
    };

    return (
        <svg
            className={cn(
                "animate-spin",
                sizeClasses[size],
                colorClasses[color],
                className
            )}
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

/**
 * iOS-style dots loading indicator
 */
export function LoadingDots({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
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
            <LoadingSpinner size="lg" />
            {message && (
                <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
            )}
        </div>
    );
}

/**
 * Inline loading state for buttons
 */
export function ButtonLoading({ className }: { className?: string }) {
    return (
        <LoadingSpinner size="sm" color="white" className={className} />
    );
}