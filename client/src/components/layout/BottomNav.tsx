import { Link, useLocation } from "wouter";
import { Home, Users, Newspaper, Dumbbell, User } from "lucide-react";
import { translations } from "@/lib/persian";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: translations.nav.home },
  { path: "/coaches", icon: Users, label: translations.nav.coaches },
  { path: "/feed", icon: Newspaper, label: translations.nav.feed },
  { path: "/programs", icon: Dumbbell, label: translations.nav.programs },
  { path: "/profile", icon: User, label: translations.nav.profile },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      data-testid="nav-bottom"
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-card/90 backdrop-blur-xl border-t border-border/50" />
      
      <div className="relative flex items-center justify-around h-18 px-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path !== "/" && location.startsWith(item.path));
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground active:scale-95"
                )}
                data-testid={`nav-${item.path.replace("/", "") || "home"}`}
              >
                {/* Active background */}
                {isActive && (
                  <span className="absolute inset-0 bg-primary/10 rounded-2xl" />
                )}
                
                {/* Icon */}
                <div className="relative">
                  <item.icon 
                    className={cn(
                      "h-6 w-6 transition-all duration-300",
                      isActive && "scale-110"
                    )} 
                  />
                  {/* Active dot */}
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/50" />
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-[10px] transition-all duration-300",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
