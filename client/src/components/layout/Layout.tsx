import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
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
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
