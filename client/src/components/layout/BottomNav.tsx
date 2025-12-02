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
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden"
      data-testid="nav-bottom"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path !== "/" && location.startsWith(item.path));
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${item.path.replace("/", "") || "home"}`}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110"
                  )} 
                />
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
