import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { SwipeBack } from "./SwipeBack";
import { PageTransition } from "./PageTransition";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import AuthPage from "@/pages/auth";
import { getQueryFn } from "@/lib/queryClient";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: currentUser, isLoading } = useQuery<User & { unreadMessages?: number } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If not logged in, show auth page without layout
  if (!currentUser) {
    return <AuthPage />;
  }

  const isHomePage = location === "/";
  const isCoachDetailPage = location.startsWith("/coaches/");
  const isSupplementDetailPage = location.startsWith("/supplement/");
  const hideBottomNav = isCoachDetailPage || isSupplementDetailPage;

  return (
    <div className="min-h-screen bg-background">
      {/* TopNav only on non-home pages - home has its own header */}
      <SwipeBack>
        <main className={hideBottomNav ? "" : "pb-20 md:pb-0"}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </SwipeBack>
      {!hideBottomNav && (
        <div className="bottom-nav-container">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
