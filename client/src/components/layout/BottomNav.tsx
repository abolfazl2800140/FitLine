import { Link, useLocation } from "wouter";
import { Home, Users, MessagesSquare, Dumbbell, User, PenSquare, MessageCircle, ShoppingBag, Wallet, GraduationCap } from "lucide-react";
import { translations } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// Nav items for regular users (athletes)
const userNavItems = [
  { path: "/coaches", icon: Users, label: translations.nav.coaches },
  { path: "/messages", icon: MessageCircle, label: "پیام‌ها" },
  { path: "/", icon: Home, label: translations.nav.home },
  { path: "/learn", icon: GraduationCap, label: "آموزش" },
  { path: "/profile", icon: User, label: translations.nav.profile },
];

// Nav items for coaches (same as users but with "همکاران" instead of "مربی‌ها")
const coachNavItems = [
  { path: "/coaches", icon: Users, label: "همکاران" },
  { path: "/messages", icon: MessageCircle, label: "پیام‌ها" },
  { path: "/", icon: Home, label: translations.nav.home },
  { path: "/learn", icon: GraduationCap, label: "آموزش" },
  { path: "/profile", icon: User, label: "پروفایل" },
];

// Haptic feedback
const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
};

export function BottomNav() {
  const [location] = useLocation();

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  // Select nav items based on user role
  const navItems = currentUser?.role === "coach" ? coachNavItems : userNavItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="nav-bottom"
    >
      {/* Glass background with blur */}
      <div className="absolute inset-0 bg-card/85 backdrop-blur-2xl border-t border-border/30" />

      <div className="relative flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = location === item.path ||
            (item.path !== "/" && location.startsWith(item.path));

          return (
            <Link key={item.path} href={item.path}>
              <motion.button
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-2 px-5 rounded-2xl",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={triggerHaptic}
                data-testid={`nav-${item.path.replace("/", "") || "home"}`}
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.span
                    className="absolute inset-0 bg-primary/12 rounded-2xl"
                    layoutId="navIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon with spring animation */}
                <motion.div
                  className="relative"
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -2 : 0
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <item.icon
                    className={cn(
                      "h-6 w-6",
                      isActive && "drop-shadow-sm"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>

                {/* Label with fade */}
                <motion.span
                  className={cn(
                    "text-[10px] leading-tight",
                    isActive ? "font-bold" : "font-medium"
                  )}
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    y: isActive ? 0 : 1
                  }}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
