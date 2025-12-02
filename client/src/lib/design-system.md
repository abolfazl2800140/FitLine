# 🎨 Elite Fitness Hub - Design System

## Overview
این Design System برای اپلیکیشن فیتنس Elite Fitness Hub طراحی شده و الهام گرفته از اپ‌های ورزشی مدرن مثل Nike Training Club و Strava است.

---

## 🎨 Color Palette

### Primary - Sport Green
رنگ اصلی برند. برای دکمه‌های اصلی، لینک‌ها و المان‌های تعاملی.

| Name | HSL | Usage |
|------|-----|-------|
| Primary | `hsl(145, 70%, 42%)` | دکمه‌ها، لینک‌ها |
| Primary Light | `hsl(145, 70%, 55%)` | Hover states |
| Primary Muted | `hsl(145, 30%, 90%)` | پس‌زمینه‌های subtle |

### Secondary - Sport Blue
رنگ ثانویه برای تنوع و اکسنت.

| Name | HSL | Usage |
|------|-----|-------|
| Secondary | `hsl(200, 85%, 50%)` | Badge‌ها، اکسنت |
| Secondary Light | `hsl(200, 85%, 65%)` | Hover states |

### Accent Colors
رنگ‌های خاص برای آیکون‌ها و وضعیت‌ها.

| Icon | Color | HSL | Usage |
|------|-------|-----|-------|
| 🔥 | Flame Orange | `hsl(25, 95%, 53%)` | کالری، streak |
| 🏆 | Trophy Gold | `hsl(45, 93%, 47%)` | رتبه، جایزه |
| ⚡ | Energy Green | `hsl(145, 70%, 42%)` | پیشرفت |
| ❤️ | Heart Red | `hsl(350, 80%, 55%)` | لایک |

---

## 📐 Spacing Scale

از مضرب‌های 4px استفاده می‌کنیم:

```
4px  → 0.25rem → spacing-1
8px  → 0.5rem  → spacing-2
12px → 0.75rem → spacing-3
16px → 1rem    → spacing-4
20px → 1.25rem → spacing-5
24px → 1.5rem  → spacing-6
32px → 2rem    → spacing-8
```

### Usage
- **px-5**: پدینگ افقی صفحات موبایل
- **py-4**: فاصله بین سکشن‌ها
- **gap-3**: فاصله بین آیتم‌های گرید
- **mb-3**: فاصله عنوان از محتوا

---

## 🔤 Typography

### Font Family
```css
--font-persian: 'Vazirmatn', 'IranYekan', system-ui, sans-serif;
--font-english: 'Inter', system-ui, sans-serif;
```

### Font Sizes
| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | متن‌های کوچک، label |
| `text-sm` | 14px | متن‌های ثانویه |
| `text-base` | 16px | متن اصلی |
| `text-lg` | 18px | عناوین سکشن |
| `text-xl` | 20px | نام کاربر |
| `text-2xl` | 24px | عناوین بزرگ |

### Font Weights
- `font-normal` (400): متن عادی
- `font-medium` (500): متن با تأکید کم
- `font-bold` (700): عناوین، دکمه‌ها
- `font-black` (900): اعداد بزرگ آماری

---

## 📦 Border Radius

| Class | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 12px | دکمه‌های معمولی |
| `rounded-xl` | 16px | Input‌ها |
| `rounded-2xl` | 24px | کارت‌ها |
| `rounded-full` | 9999px | دکمه‌های pill، آواتار |

---

## 🧩 Components

### 1. Stat Card (کارت آمار)
```tsx
<div className="bg-card rounded-2xl p-3 text-center border border-border/50">
  <Icon className="h-5 w-5 mx-auto mb-1 text-primary" />
  <p className="text-lg font-bold">۵</p>
  <p className="text-[10px] text-muted-foreground">تمرین</p>
</div>
```

### 2. CTA Card (کارت اقدام)
```tsx
<Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-white">
  <CardContent className="p-5">
    {/* Content */}
  </CardContent>
</Card>
```

### 3. Pill Button (دکمه گرد)
```tsx
<Button variant="outline" className="rounded-full gap-2 whitespace-nowrap border-2">
  <Icon className="h-4 w-4" />
  متن
</Button>
```

### 4. Section Header (هدر سکشن)
```tsx
<div className="flex items-center justify-between px-5 mb-3">
  <h2 className="font-bold text-lg">عنوان</h2>
  <Button variant="ghost" size="sm" className="gap-1 text-primary">
    همه
    <ChevronLeft className="h-4 w-4" />
  </Button>
</div>
```

### 5. Horizontal Scroll List (لیست افقی)
```tsx
<div className="flex gap-4 overflow-x-auto px-5 no-scrollbar pb-2">
  {items.map(item => (
    <div key={item.id} className="min-w-[160px]">
      <ItemCard {...item} compact />
    </div>
  ))}
</div>
```

### 6. Compact Card (کارت فشرده)
```tsx
<Card className="overflow-hidden border border-border/50 bg-card hover:shadow-md transition-all">
  <CardContent className="p-3">
    <Avatar className="h-16 w-16" />
    <h3 className="font-bold text-sm">{name}</h3>
    <Badge className="text-[10px]">{specialty}</Badge>
  </CardContent>
</Card>
```

---

## 🎭 States & Interactions

### Hover
```css
hover:shadow-md
hover:bg-white/20
group-hover:text-primary
```

### Active/Pressed
```css
active:scale-95
press-effect
```

### Focus
```css
focus-visible:ring-2 
focus-visible:ring-primary 
focus-visible:ring-offset-2
```

### Disabled
```css
disabled:opacity-50
disabled:cursor-not-allowed
```

---

## 📱 Layout Patterns

### Page Container
```tsx
<div className="min-h-screen bg-background">
  {/* Sections */}
</div>
```

### Section
```tsx
<section className="px-5 py-4">
  {/* Content */}
</section>
```

### Grid (4 columns for stats)
```tsx
<div className="grid grid-cols-4 gap-3">
  {/* Items */}
</div>
```

---

## 🌙 Dark Mode

تم تاریک با همان ساختار رنگی ولی با مقادیر معکوس:
- پس‌زمینه: `hsl(0, 0%, 5%)`
- کارت‌ها: `hsl(0, 0%, 8%)`
- Primary کمی روشن‌تر: `hsl(145, 70%, 48%)`

---

## ✅ Do's & Don'ts

### ✅ Do
- از `rounded-2xl` برای کارت‌ها استفاده کنید
- از `border-border/50` برای بردرهای subtle استفاده کنید
- از لیست‌های افقی اسکرول‌شونده برای موبایل استفاده کنید
- از آیکون‌های Lucide استفاده کنید
- اعداد را به فارسی نمایش دهید

### ❌ Don't
- از سایه‌های سنگین استفاده نکنید
- از رنگ‌های خارج از پالت استفاده نکنید
- از فونت‌های دیگر استفاده نکنید
- از گوشه‌های تیز استفاده نکنید
