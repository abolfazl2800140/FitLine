# راهنمای نصب و راه‌اندازی FitLine

این راهنما قدم به قدم نحوه راه‌اندازی پروژه روی سیستم شما را توضیح می‌دهد.

---

## پیش‌نیازها

قبل از شروع، مطمئن شوید که این برنامه‌ها روی سیستم شما نصب هستند:

### 1. Node.js (نسخه 18 یا بالاتر)

دانلود از: https://nodejs.org

برای بررسی نصب بودن:
```bash
node --version
# باید چیزی مثل v18.x.x یا v20.x.x نمایش دهد
```

### 2. PostgreSQL (نسخه 14 یا بالاتر)

#### Windows:
1. دانلود از: https://www.postgresql.org/download/windows/
2. نصب کنید و رمز عبور برای کاربر `postgres` تعیین کنید
3. پورت پیش‌فرض 5432 را تغییر ندهید

#### Mac:
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## مراحل نصب

### قدم 1: کلون کردن پروژه

```bash
git clone <آدرس-ریپو>
cd fitline
```

### قدم 2: نصب پکیج‌ها

```bash
npm install
```

این دستور ممکن است چند دقیقه طول بکشد.

### قدم 3: ساخت دیتابیس

#### روش 1: با pgAdmin (گرافیکی)
1. pgAdmin را باز کنید
2. روی Databases راست کلیک کنید
3. Create > Database را انتخاب کنید
4. نام: `fitline`
5. Save کنید

#### روش 2: با Command Line
```bash
# وارد PostgreSQL شوید
psql -U postgres

# دیتابیس بسازید
CREATE DATABASE fitline;

# خارج شوید
\q
```

### قدم 4: تنظیم فایل Environment

فایل `.env.example` را کپی کنید:

```bash
cp .env.example .env
```

سپس فایل `.env` را باز کنید و تنظیمات را وارد کنید:

```env
# آدرس دیتابیس
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/fitline

# کلید امنیتی (هر چیزی می‌تواند باشد)
SESSION_SECRET=my-super-secret-key-12345
```

⚠️ **مهم:** `YOUR_PASSWORD` را با رمز عبور PostgreSQL خود جایگزین کنید.

### قدم 5: ساخت جداول دیتابیس

```bash
npm run db:push
```

این دستور تمام جداول مورد نیاز را در دیتابیس می‌سازد.

### قدم 6: اضافه کردن داده‌های نمونه (اختیاری)

```bash
npm run db:seed
```

این دستور کاربران، مربیان، پست‌ها، آموزش‌ها و مقالات نمونه اضافه می‌کند.

**کاربران نمونه:**
| نوع | شماره موبایل | رمز عبور |
|-----|-------------|----------|
| کاربر عادی | 09123456789 | password123 |
| مربی | 09111111111 | password123 |

### قدم 7: اجرای پروژه

```bash
npm run dev
```

پروژه روی آدرس زیر اجرا می‌شود:
```
http://localhost:5000
```

---

## عیب‌یابی

### خطای اتصال به دیتابیس

اگر خطای `connection refused` دیدید:
1. مطمئن شوید PostgreSQL در حال اجراست
2. رمز عبور در `.env` را بررسی کنید
3. نام دیتابیس `fitline` را بررسی کنید

```bash
# بررسی وضعیت PostgreSQL در Windows
# Services را باز کنید و postgresql را چک کنید

# در Mac/Linux
sudo systemctl status postgresql
```

### خطای پورت 5000

اگر پورت 5000 اشغال است:
```bash
# در Windows
netstat -ano | findstr :5000

# در Mac/Linux
lsof -i :5000
```

### خطای npm install

```bash
# پاک کردن cache
npm cache clean --force

# حذف node_modules و نصب مجدد
rm -rf node_modules
npm install
```

---

## دستورات مفید

| دستور | توضیح |
|-------|-------|
| `npm run dev` | اجرای سرور توسعه |
| `npm run build` | ساخت نسخه production |
| `npm run start` | اجرای نسخه production |
| `npm run db:push` | اعمال تغییرات schema به دیتابیس |
| `npm run db:seed` | اضافه کردن داده‌های نمونه |

---

## ساختار پروژه

```
fitline/
├── client/           # فرانت‌اند (React)
│   ├── src/
│   │   ├── components/   # کامپوننت‌ها
│   │   ├── pages/        # صفحات
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # توابع کمکی
├── server/           # بک‌اند (Express)
│   ├── routes/       # API routes
│   └── storage.ts    # Database queries
├── shared/           # کد مشترک
│   └── schema.ts     # Database schema
└── scripts/          # اسکریپت‌های کمکی
```

---

## سوالات متداول

**س: آیا می‌توانم از MySQL استفاده کنم؟**
خیر، پروژه فقط با PostgreSQL کار می‌کند.

**س: چطور کاربر جدید بسازم؟**
از صفحه `/auth` در اپلیکیشن ثبت‌نام کنید.

**س: داده‌های نمونه را چطور پاک کنم؟**
دیتابیس را drop کنید و دوباره بسازید:
```sql
DROP DATABASE fitline;
CREATE DATABASE fitline;
```
سپس `npm run db:push` را اجرا کنید.

---

موفق باشید! 🚀
