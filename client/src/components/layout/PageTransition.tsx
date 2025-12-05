import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ReactNode, useRef, useEffect } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// iOS-like spring physics for native feel
const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

const pageVariants = {
  initial: {
    opacity: 0,
    x: 30,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 35,
    },
  },
};

// Haptic feedback helper
const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };
    navigator.vibrate(patterns[style]);
  }
};

export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const prevLocation = useRef(location);

  // Trigger haptic on page change
  useEffect(() => {
    if (prevLocation.current !== location) {
      triggerHaptic('light');
      prevLocation.current = location;
    }
  }, [location]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="min-h-full will-change-transform"
        style={{
          backfaceVisibility: 'hidden',
          perspective: 1000,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Export haptic for use in other components
export { triggerHaptic };
