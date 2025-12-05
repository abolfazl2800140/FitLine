import { Link, useLocation } from "wouter";
import {
  Home,
  Users,
  Newspaper,
  Dumbbell,
  User,
  MessageCircle,
  ShoppingBag,
  Trophy,
  MessagesSquare,
  Zap,
  Search,
  Bell,
  Menu,
  ChevronLeft,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const mainNavItems = [
  { path: "/", icon: Home, label: translations.nav.home },
  { path: "/coaches", icon: Users, label: translations.nav.coaches },
  { path: "/education", icon: MessagesSquare, label: "انجمن" },
  { path: "/programs", icon: Dumbbell, label: translations.nav.programs },
  { path: "/store", icon: ShoppingBag, label: translations.nav.store },
];

const secondaryNavItems = [
  { path: "/leagues", icon: Trophy, label: translations.nav.leagues },
  { path: "/challenges", icon: Zap, label: translations.nav.challenges },
  { path: "/feed", icon: Newspaper, label: translations.nav.feed },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    },
  });

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient border effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">

          {/* Right Section - Menu (RTL) */}
          <div className="flex items-center lg:hidden">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden relative overflow-hidden group h-11 w-11"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  <Menu className="h-7 w-7 relative z-10" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0 border-l-primary/20">
                <div className="flex flex-col h-full bg-gradient-to-b from-card to-background">
                  {/* Menu Header */}
                  <div className="p-5 border-b border-border/50">
                    <div className="flex items-center justify-end mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                          <span className="text-primary-foreground font-black text-lg">F</span>
                        </div>
                      </div>
                    </div>

                    {/* User Info in Menu */}
                    {user && (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/80 border border-border/50">
                        <Avatar className="h-12 w-12 border-2 border-primary/30">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                            {user.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{user.fullName}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>۱۲ روز متوالی</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Items */}
                  <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-1">
                      {[...mainNavItems, ...secondaryNavItems].map((item) => {
                        const isActive = location === item.path ||
                          (item.path !== "/" && location.startsWith(item.path));

                        return (
                          <Link key={item.path} href={item.path}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start gap-3 h-12 rounded-xl transition-all",
                                isActive
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "hover:bg-card"
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <div className={cn(
                                "p-1.5 rounded-lg",
                                isActive ? "bg-primary/20" : "bg-muted/50"
                              )}>
                                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                              </div>
                              <span className="font-medium">{item.label}</span>
                              {isActive && (
                                <ChevronLeft className="h-4 w-4 mr-auto text-primary" />
                              )}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Menu Footer */}
                  <div className="p-4 border-t border-border/50 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-11 rounded-xl"
                      onClick={() => {
                        setLocation("/settings");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      <span>تنظیمات</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-11 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLogoutDialogOpen(true);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>خروج</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

          </div>

          {/* Desktop Navigation */}
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
                      "gap-2 rounded-xl",
                      isActive && "bg-primary/10 text-primary border border-primary/20"
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
                <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
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

          {/* Desktop Search */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={translations.common.search + "..."}
                className="pr-10 bg-card/50 border-border/50 rounded-xl focus-visible:ring-primary/30 focus-visible:border-primary/30"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/messages">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl"
                    data-testid="button-messages"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {user.unreadMessages && user.unreadMessages > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-[10px] bg-primary"
                      >
                        {user.unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-xl"
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-9 w-9 border-2 border-primary/30">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
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
                      <Settings className="h-4 w-4" />
                      {translations.nav.settings}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer text-destructive"
                      onClick={() => setLogoutDialogOpen(true)}
                    >
                      <LogOut className="h-4 w-4" />
                      {translations.auth.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-xl" data-testid="button-login">
                    {translations.auth.login}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-xl" data-testid="button-register">
                    {translations.auth.register}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Left Section - Logo (RTL) */}
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group" data-testid="nav-logo">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center transition-all group-hover:scale-105">
                <span className="text-primary-foreground font-black text-xl">F</span>
              </div>
              <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="font-black text-lg tracking-tight text-primary">FIT</span>
                <span className="text-[10px] font-semibold text-muted-foreground tracking-widest">LINE</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>خروج از حساب کاربری</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => logoutMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              بله، خارج شو
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
