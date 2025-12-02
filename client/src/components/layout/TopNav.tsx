import { Link, useLocation } from "wouter";
import { Home, Users, Newspaper, Dumbbell, User, MessageCircle, ShoppingBag, Trophy, HelpCircle, Zap, Search, Bell, Menu } from "lucide-react";
import { translations } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const mainNavItems = [
  { path: "/", icon: Home, label: translations.nav.home },
  { path: "/coaches", icon: Users, label: translations.nav.coaches },
  { path: "/feed", icon: Newspaper, label: translations.nav.feed },
  { path: "/programs", icon: Dumbbell, label: translations.nav.programs },
  { path: "/store", icon: ShoppingBag, label: translations.nav.store },
];

const secondaryNavItems = [
  { path: "/leagues", icon: Trophy, label: translations.nav.leagues },
  { path: "/challenges", icon: Zap, label: translations.nav.challenges },
  { path: "/education", icon: HelpCircle, label: translations.nav.education },
];

interface TopNavProps {
  user?: {
    id: string;
    fullName: string;
    avatar?: string | null;
    unreadMessages?: number;
  } | null;
}

export function TopNav({ user }: TopNavProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4 md:px-6">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="nav-logo">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">F</span>
            </div>
            <span className="hidden sm:block font-bold text-xl text-gradient-orange">
              فیت‌لاین
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {mainNavItems.map((item) => {
            const isActive = location === item.path || 
              (item.path !== "/" && location.startsWith(item.path));
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                  data-testid={`topnav-${item.path.replace("/", "") || "home"}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                <span>بیشتر</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {secondaryNavItems.map((item) => (
                <DropdownMenuItem 
                  key={item.path} 
                  onClick={() => setLocation(item.path)}
                  className="gap-2 cursor-pointer"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={translations.common.search + "..."}
              className="pr-10 bg-muted/50 border-0 focus-visible:ring-1"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mr-auto">
          {user ? (
            <>
              <Link href="/messages">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  data-testid="button-messages"
                >
                  <MessageCircle className="h-5 w-5" />
                  {user.unreadMessages && user.unreadMessages > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -left-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                    >
                      {user.unreadMessages}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 left-1 h-2 w-2 bg-primary rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">مشاهده پروفایل</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setLocation("/profile")}
                    className="gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    {translations.nav.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLocation("/settings")}
                    className="gap-2 cursor-pointer"
                  >
                    {translations.nav.settings}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                    {translations.auth.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="button-login">
                  {translations.auth.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" data-testid="button-register">
                  {translations.auth.register}
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xl">F</span>
                  </div>
                  <span className="font-bold text-2xl text-gradient-orange">فیت‌لاین</span>
                </div>
              </div>
              
              <nav className="flex-1 p-4">
                <div className="space-y-1">
                  {[...mainNavItems, ...secondaryNavItems].map((item) => {
                    const isActive = location === item.path || 
                      (item.path !== "/" && location.startsWith(item.path));
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start gap-3"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
