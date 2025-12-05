import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/hooks/useHaptic";

interface ActionSheetProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    description?: string;
}

interface ActionSheetItemProps {
    children: ReactNode;
    onClick?: () => void;
    destructive?: boolean;
    disabled?: boolean;
    icon?: ReactNode;
}

export function ActionSheet({
    open,
    onClose,
    children,
    title,
    description
}: ActionSheetProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 300,
                            mass: 0.8
                        }}
                        className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2"
                        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
                    >
                        {/* Main content */}
                        <div className="bg-card/95 backdrop-blur-xl rounded-2xl overflow-hidden mb-2">
                            {/* Header */}
                            {(title || description) && (
                                <div className="px-4 py-3 text-center border-b border-border/50">
                                    {title && (
                                        <p className="text-sm font-semibold text-foreground">{title}</p>
                                    )}
                                    {description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="divide-y divide-border/50">
                                {children}
                            </div>
                        </div>

                        {/* Cancel button */}
                        <button
                            onClick={() => {
                                triggerHaptic('light');
                                onClose();
                            }}
                            className="w-full bg-card/95 backdrop-blur-xl rounded-2xl py-4 text-primary font-semibold text-base active:bg-accent transition-colors"
                        >
                            انصراف
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export function ActionSheetItem({
    children,
    onClick,
    destructive = false,
    disabled = false,
    icon
}: ActionSheetItemProps) {
    return (
        <button
            onClick={() => {
                if (!disabled) {
                    triggerHaptic(destructive ? 'warning' : 'light');
                    onClick?.();
                }
            }}
            disabled={disabled}
            className={cn(
                "w-full py-4 px-4 text-base font-medium flex items-center justify-center gap-2",
                "active:bg-accent/80 transition-colors",
                destructive && "text-destructive",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {icon}
            {children}
        </button>
    );
}