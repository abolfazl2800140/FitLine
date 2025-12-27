# FitLine - اپلیکیشن فیتنس

یک اپلیکیشن کامل فیتنس با React و Node.js

## پیش‌نیازها

- Node.js 18+
- PostgreSQL 14+

## نصب و راه‌اندازی

### 1. کلون پروژه
```bash
git clone <repo-url>
cd fitline
```

### 2. نصب پکیج‌ها
```bash
npm install
```

### 3. تنظیم دیتابیس

ابتدا PostgreSQL رو نصب کنید، سپس یک دیتابیس بسازید:

```sql
CREATE DATABASE fitline;
```

### 4. تنظیم Environment Variables

فایل `.env` بسازید:
```bash
cp .env.example .env
```

سپس `DATABASE_URL` رو تنظیم کنید:
```
DATABASE_URL=postgresql://username:password@localhost:5432/fitline
```

### 5. ساخت جداول دیتابیس
```bash
npm run db:setup
```

### 6. اضافه کردن داده‌های نمونه (اختیاری)
```bash
npm run db:seed
```

### 7. اجرای پروژه
```bash
npm run dev
```

اپلیکیشن روی `http://localhost:5000` اجرا میشه.

## اسکریپت‌ها

| دستور | توضیح |
|-------|-------|
| `npm run dev` | اجرای development server |
| `npm run build` | ساخت نسخه production |
| `npm run start` | اجرای نسخه production |
| `npm run db:setup` | ساخت جداول دیتابیس |
| `npm run db:seed` | اضافه کردن داده‌های نمونه |
| `npm run db:push` | اعمال تغییرات schema |

## تکنولوژی‌ها

- **Frontend:** React, TailwindCSS, React Query, Framer Motion
- **Backend:** Express.js, WebSocket
- **Database:** PostgreSQL, Drizzle ORM
- **Auth:** Passport.js, Sessions
