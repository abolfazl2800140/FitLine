import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dumbbell,
  Flame,
  Trophy,
  TrendingUp,
  Users,
  Zap,
  Star,
  Heart,
  ChevronLeft,
  Play,
  Clock,
} from "lucide-react";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background p-5 pb-24">
      <h1 className="text-2xl font-bold mb-6">🎨 Design System</h1>

      {/* Colors */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">رنگ‌ها</h2>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-primary" />
            <p className="text-xs text-center">Primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-secondary" />
            <p className="text-xs text-center">Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-orange-500" />
            <p className="text-xs text-center">Flame</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-yellow-500" />
            <p className="text-xs text-center">Trophy</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">تایپوگرافی</h2>
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-2xl font-bold">عنوان بزرگ - text-2xl</p>
            <p className="text-xl font-bold">عنوان - text-xl</p>
            <p className="text-lg font-bold">عنوان سکشن - text-lg</p>
            <p className="text-base">متن عادی - text-base</p>
            <p className="text-sm text-muted-foreground">متن ثانویه - text-sm</p>
            <p className="text-xs text-muted-foreground">متن کوچک - text-xs</p>
          </CardContent>
        </Card>
      </section>

      {/* Buttons */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">دکمه‌ها</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">کوچک</Button>
            <Button size="default">متوسط</Button>
            <Button size="lg">بزرگ</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full gap-2">
              <Users className="h-4 w-4" />
              Pill Button
            </Button>
            <Button variant="outline" className="rounded-full border-2 gap-2">
              <Dumbbell className="h-4 w-4" />
              Outline Pill
            </Button>
          </div>
          <div>
            <Button size="lg" className="rounded-full h-14 w-14 p-0">
              <Play className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">Badge‌ها</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>پیش‌فرض</Badge>
          <Badge variant="secondary">ثانویه</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">خطا</Badge>
          <Badge className="gap-1">
            <Flame className="h-3 w-3" />
            ۱۲ روز
          </Badge>
        </div>
      </section>

      {/* Avatars */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">آواتار</h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">ع</AvatarFallback>
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">ع</AvatarFallback>
          </Avatar>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">ع</AvatarFallback>
          </Avatar>
          <Avatar className="h-20 w-20 border-2 border-primary/30">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">ع</AvatarFallback>
          </Avatar>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">کارت آمار</h2>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
            <Dumbbell className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">۵</p>
            <p className="text-[10px] text-muted-foreground">تمرین</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
            <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-lg font-bold">۲.۴K</p>
            <p className="text-[10px] text-muted-foreground">کالری</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-bold">#۱۲</p>
            <p className="text-[10px] text-muted-foreground">رتبه</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center border border-border/50">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-bold">۸۵%</p>
            <p className="text-[10px] text-muted-foreground">پیشرفت</p>
          </div>
        </div>
      </section>

      {/* CTA Card */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">کارت CTA</h2>
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">تمرین امروز</p>
                <h3 className="text-lg font-bold mb-2">تمرین بالاتنه - روز ۳</h3>
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    ۴۵ دقیقه
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    ۳۵۰ کالری
                  </span>
                </div>
              </div>
              <Button size="lg" variant="secondary" className="rounded-full h-14 w-14 p-0 shadow-lg">
                <Play className="h-6 w-6 mr-0.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section Header */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">هدر سکشن</h2>
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="font-bold text-lg">مربیان برتر</h2>
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                همه
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Input */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">Input</h2>
        <div className="space-y-3">
          <Input placeholder="جستجو..." />
          <Input placeholder="ایمیل" type="email" />
        </div>
      </section>

      {/* Icons */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">آیکون‌ها</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center gap-1">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-xs">تمرین</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Flame className="h-6 w-6 text-orange-500" />
            <span className="text-xs">کالری</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="text-xs">رتبه</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <TrendingUp className="h-6 w-6 text-green-500" />
            <span className="text-xs">پیشرفت</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="h-6 w-6 text-primary" />
            <span className="text-xs">مربیان</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xs">چالش</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            <span className="text-xs">امتیاز</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heart className="h-6 w-6 text-red-500" />
            <span className="text-xs">لایک</span>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">Spacing</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded" />
            <span className="text-sm">4px - gap-1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-primary rounded" />
            <span className="text-sm">8px - gap-2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-4 bg-primary rounded" />
            <span className="text-sm">12px - gap-3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-4 bg-primary rounded" />
            <span className="text-sm">16px - gap-4</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-4 bg-primary rounded" />
            <span className="text-sm">20px - gap-5</span>
          </div>
        </div>
      </section>

      {/* Border Radius */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">Border Radius</h2>
        <div className="flex flex-wrap gap-4">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white text-xs">lg</div>
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white text-xs">xl</div>
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-xs">2xl</div>
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xs">full</div>
        </div>
      </section>
    </div>
  );
}
