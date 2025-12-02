import { useRef, ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useLocation } from "wouter";

interface SwipeBackProps {
  children: ReactNode;
}

const SWIPE_THRESHOLD = 100;
const EDGE_WIDTH = 30;

export function SwipeBack({ children }: SwipeBackProps) {
  const [location, setLocation] = useLocation();
  const startX = useRef(0);
  const isEdgeSwipe = useRef(false);
  const dragX = useMotionValue(0);
  
  const overlayOpacity = useTransform(dragX, [0, 200], [0, 0.3]);
  const pageScale = useTransform(dragX, [0, 300], [1, 0.95]);

  // Don't enable swipe back on home page
  const canGoBack = location !== "/";

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canGoBack) return;
    
    const touch = e.touches[0];
    // RTL: check right edge
    const isRightEdge = window.innerWidth - touch.clientX < EDGE_WIDTH;
    
    if (isRightEdge) {
      startX.current = touch.clientX;
      isEdgeSwipe.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isEdgeSwipe.current || !canGoBack) return;
    
    const touch = e.touches[0];
    const diff = startX.current - touch.clientX; // RTL: swipe left to go back
    
    if (diff > 0) {
      dragX.set(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isEdgeSwipe.current || !canGoBack) return;
    
    const currentDrag = dragX.get();
    
    if (currentDrag > SWIPE_THRESHOLD) {
      // Navigate back
      animate(dragX, window.innerWidth, { 
        duration: 0.2,
        onComplete: () => {
          window.history.back();
          dragX.set(0);
        }
      });
    } else {
      // Cancel swipe
      animate(dragX, 0, { duration: 0.2 });
    }
    
    isEdgeSwipe.current = false;
    startX.current = 0;
  };

  return (
    <div 
      className="relative h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dark overlay */}
      <motion.div
        className="fixed inset-0 bg-black pointer-events-none z-40"
        style={{ opacity: overlayOpacity }}
      />
      
      {/* Edge indicator */}
      {canGoBack && (
        <div className="fixed top-0 right-0 bottom-0 w-1 bg-gradient-to-l from-primary/20 to-transparent z-50 pointer-events-none md:hidden" />
      )}
      
      {/* Content */}
      <motion.div
        className="h-full"
        style={{ 
          x: useTransform(dragX, (v) => -v),
          scale: pageScale 
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
