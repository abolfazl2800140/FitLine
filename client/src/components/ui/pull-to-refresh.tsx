import { useState, useRef, ReactNode, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Loader2, ArrowDown } from "lucide-react";
import { triggerHaptic } from "@/hooks/useHaptic";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

const PULL_THRESHOLD = 70;
const MAX_PULL = 100;
const HAPTIC_THRESHOLD = 60;

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pullDistance = useMotionValue(0);

  const spinnerOpacity = useTransform(pullDistance, [0, 40, PULL_THRESHOLD], [0, 0.5, 1]);
  const spinnerScale = useTransform(pullDistance, [0, PULL_THRESHOLD], [0.3, 1]);
  const spinnerRotate = useTransform(pullDistance, [0, MAX_PULL], [0, 360]);
  const indicatorY = useTransform(pullDistance, [0, MAX_PULL], [-40, 0]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setHasTriggeredHaptic(false);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || startY.current === 0) return;

    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) {
      startY.current = 0;
      pullDistance.set(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Rubber band resistance effect
      const resistance = 1 - Math.min(diff / 300, 0.6);
      const pull = Math.min(diff * resistance * 0.5, MAX_PULL);
      pullDistance.set(pull);

      // Haptic feedback when reaching threshold
      if (pull >= HAPTIC_THRESHOLD && !hasTriggeredHaptic) {
        triggerHaptic('medium');
        setHasTriggeredHaptic(true);
      }
    }
  }, [disabled, isRefreshing, pullDistance, hasTriggeredHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    const currentPull = pullDistance.get();

    if (currentPull >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      triggerHaptic('success');

      // Spring animation to loading position
      animate(pullDistance, 50, {
        type: "spring",
        stiffness: 400,
        damping: 30
      });

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        // Spring back
        animate(pullDistance, 0, {
          type: "spring",
          stiffness: 300,
          damping: 25
        });
      }
    } else {
      // Bounce back
      animate(pullDistance, 0, {
        type: "spring",
        stiffness: 400,
        damping: 25
      });
    }

    startY.current = 0;
    setHasTriggeredHaptic(false);
  }, [disabled, isRefreshing, pullDistance, onRefresh]);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Pull indicator - iOS style */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          height: pullDistance,
          opacity: spinnerOpacity,
          y: indicatorY
        }}
      >
        <motion.div
          className="bg-card border border-border/50 text-foreground rounded-full p-2.5 shadow-lg backdrop-blur-sm"
          style={{
            scale: spinnerScale,
            rotate: isRefreshing ? undefined : spinnerRotate
          }}
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          )}
        </motion.div>
      </motion.div>

      {/* Content with transform */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-y-auto overscroll-contain"
        style={{
          y: pullDistance,
          WebkitOverflowScrolling: 'touch'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
