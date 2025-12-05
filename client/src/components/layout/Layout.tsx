import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { SwipeBack } from "./SwipeBack";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import AuthPage from "@/pages/auth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: currentUser, isLoading } = useQuery<User & { unreadMessages?: number }>({
    queryKey: ["/api/auth/me"],
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

  return (
    <div className="min-h-screen bg-background">
      {isHomePage && <TopNav user={currentUser} />}
      <SwipeBack>
        <main className="pb-20 md:pb-0">
          {children}
        </main>
      </SwipeBack>
      <BottomNav />
    </div>
  );
}
