import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { SwipeBack } from "./SwipeBack";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { data: currentUser } = useQuery<User & { unreadMessages?: number }>({
    queryKey: ["/api/auth/me"],
  });

  return (
    <div className="min-h-screen bg-background">
      <TopNav user={currentUser} />
      <SwipeBack>
        <main className="pb-20 md:pb-0">
          {children}
        </main>
      </SwipeBack>
      <BottomNav />
    </div>
  );
}
