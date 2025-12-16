import "dotenv/config";
import { db, pool } from "./local-db";
import { exerciseTutorials, articles, users, coachProfiles } from "../shared/schema";
import { eq, and } from "drizzle-orm";

async function seedEducation() {
  console.log("🎓 Seeding education content...");

  // Get verified coaches
  const verifiedCoaches = await db
    .select({ userId: coachProfiles.userId, fullName: users.fullName })
    .from(coachProfiles)
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .where(eq(coachProfiles.isVerified, true))
    .limit(3);

  if (verifiedCoaches.length === 0) {
    console.log("❌ No verified coaches found. Please run main seed first.");
    await pool.end();
    return;
  }

  const coach1 = verifiedCoaches[0];
  const coach2 = verifiedCoaches[1] || coach1;

  // Seed Exercise Tutorials
  await db.insert(exerciseTutorials).values([
    {
      coachId: coach1.userId,
      name: "پرس سینه با هالتر",
      description: "پرس سینه یکی از بهترین حرکات برای تقویت عضلات سینه است. این حرکت عضلات سینه‌ای بزرگ، دلتوئید قدامی و سه سر بازو را درگیر می‌کند.",
      muscleGroup: "chest",
      secondaryMuscles: ["shoulders", "triceps"],
      difficulty: "beginner",
      thumbnailUrl: "https://picsum.photos/seed/bench-press/600/400",
      instructions: [
        "روی نیمکت دراز بکشید و پاها را روی زمین قرار دهید",
        "هالتر را با فاصله کمی بیشتر از عرض شانه بگیرید",
        "هالتر را از جایگاه بردارید و بالای سینه نگه دارید",
        "به آرامی هالتر را پایین بیاورید تا به سینه برسد",
        "با فشار دادن، هالتر را به بالا برگردانید"
      ],
      tips: [
        "کمر را صاف نگه دارید و قوس طبیعی را حفظ کنید",
        "آرنج‌ها را در زاویه ۴۵ درجه نگه دارید",
        "تنفس را فراموش نکنید: پایین آوردن = دم، بالا بردن = بازدم"
      ],
      commonMistakes: [
        "بالا آوردن باسن از روی نیمکت",
        "پایین آوردن هالتر به سمت گردن",
        "قفل کردن آرنج در بالا"
      ],
      likeCount: 45,
      viewCount: 230,
    },
    {
      coachId: coach1.userId,
      name: "اسکات با هالتر",
      description: "اسکات حرکتی ترکیبی است که تقریباً تمام عضلات پایین‌تنه را درگیر می‌کند. این حرکت برای افزایش قدرت و حجم پا ضروری است.",
      muscleGroup: "legs",
      secondaryMuscles: ["glutes", "abs"],
      difficulty: "intermediate",
      thumbnailUrl: "https://picsum.photos/seed/squat/600/400",
      instructions: [
        "هالتر را روی عضلات ذوزنقه قرار دهید",
        "پاها را به اندازه عرض شانه باز کنید",
        "با خم کردن زانو و ران، پایین بروید",
        "تا جایی پایین بروید که ران‌ها موازی زمین شوند",
        "با فشار از پاشنه، به حالت اول برگردید"
      ],
      tips: [
        "زانوها را در راستای انگشتان پا نگه دارید",
        "سینه را بالا و کمر را صاف نگه دارید",
        "وزن را روی پاشنه‌ها حفظ کنید"
      ],
      commonMistakes: [
        "جلو آمدن زانوها از انگشتان پا",
        "گرد کردن کمر",
        "بلند کردن پاشنه از زمین"
      ],
      likeCount: 67,
      viewCount: 340,
    },
    {
      coachId: coach2.userId,
      name: "ددلیفت رومانیایی",
      description: "ددلیفت رومانیایی یکی از بهترین حرکات برای تقویت همسترینگ و عضلات پشت ران است.",
      muscleGroup: "legs",
      secondaryMuscles: ["back", "glutes"],
      difficulty: "intermediate",
      thumbnailUrl: "https://picsum.photos/seed/rdl/600/400",
      instructions: [
        "هالتر را با دست‌های صاف جلوی ران نگه دارید",
        "زانوها را کمی خم کنید",
        "با حفظ کمر صاف، از ران به جلو خم شوید",
        "هالتر را تا زیر زانو پایین ببرید",
        "با فشار از همسترینگ به حالت اول برگردید"
      ],
      tips: [
        "کمر را در تمام طول حرکت صاف نگه دارید",
        "هالتر را نزدیک بدن حرکت دهید",
        "کشش را در همسترینگ احساس کنید"
      ],
      commonMistakes: [
        "گرد کردن کمر",
        "خم کردن بیش از حد زانو",
        "دور کردن هالتر از بدن"
      ],
      likeCount: 34,
      viewCount: 180,
    },
    {
      coachId: coach1.userId,
      name: "جلو بازو با دمبل",
      description: "حرکت کلاسیک برای تقویت عضله دوسر بازویی (بایسپس).",
      muscleGroup: "biceps",
      difficulty: "beginner",
      thumbnailUrl: "https://picsum.photos/seed/bicep-curl/600/400",
      instructions: [
        "دمبل‌ها را در دو طرف بدن نگه دارید",
        "آرنج‌ها را ثابت نگه دارید",
        "با خم کردن آرنج، دمبل را بالا بیاورید",
        "در بالا مکث کنید و عضله را منقبض کنید",
        "به آرامی به حالت اول برگردید"
      ],
      tips: [
        "از تکان دادن بدن خودداری کنید",
        "حرکت را کنترل شده انجام دهید",
        "در بالای حرکت عضله را فشار دهید"
      ],
      commonMistakes: [
        "تکان دادن بدن برای بالا بردن وزنه",
        "حرکت سریع و بدون کنترل",
        "خم کردن مچ دست"
      ],
      likeCount: 28,
      viewCount: 150,
    },
    {
      coachId: coach2.userId,
      name: "پلانک",
      description: "پلانک یکی از بهترین حرکات برای تقویت عضلات مرکزی بدن (Core) است.",
      muscleGroup: "abs",
      secondaryMuscles: ["shoulders"],
      difficulty: "beginner",
      thumbnailUrl: "https://picsum.photos/seed/plank/600/400",
      instructions: [
        "روی ساعدها و نوک پا قرار بگیرید",
        "بدن را از سر تا پاشنه صاف نگه دارید",
        "شکم را منقبض کنید",
        "این وضعیت را حفظ کنید"
      ],
      tips: [
        "باسن را بالا یا پایین نبرید",
        "به جلو نگاه کنید",
        "تنفس را فراموش نکنید"
      ],
      commonMistakes: [
        "افتادن کمر به پایین",
        "بالا بردن باسن",
        "نگه داشتن نفس"
      ],
      likeCount: 52,
      viewCount: 280,
    },
  ]);

  console.log("✅ Exercise tutorials created");

  // Seed Articles
  await db.insert(articles).values([
    {
      authorId: coach1.userId,
      title: "راهنمای کامل تغذیه برای افزایش حجم عضلانی",
      slug: "muscle-building-nutrition-guide-" + Date.now(),
      content: `افزایش حجم عضلانی نیازمند ترکیبی از تمرین صحیح و تغذیه مناسب است. در این مقاله به بررسی اصول تغذیه برای افزایش حجم می‌پردازیم.

کالری مازاد
برای افزایش حجم، باید کالری بیشتری از نیاز روزانه مصرف کنید. معمولاً ۳۰۰ تا ۵۰۰ کالری مازاد کافی است.

پروتئین کافی
پروتئین ماده اصلی ساخت عضله است. حداقل ۱.۶ تا ۲.۲ گرم پروتئین به ازای هر کیلوگرم وزن بدن مصرف کنید.

منابع خوب پروتئین:
- مرغ و بوقلمون
- گوشت قرمز کم‌چرب
- ماهی و میگو
- تخم‌مرغ
- لبنیات
- حبوبات

کربوهیدرات
کربوهیدرات سوخت اصلی تمرینات سنگین است. ۴ تا ۶ گرم به ازای هر کیلوگرم وزن بدن مصرف کنید.

چربی سالم
چربی برای تولید هورمون‌ها ضروری است. ۰.۵ تا ۱ گرم به ازای هر کیلوگرم وزن بدن کافی است.

زمان‌بندی وعده‌ها
- قبل از تمرین: کربوهیدرات + پروتئین
- بعد از تمرین: پروتئین + کربوهیدرات سریع
- قبل از خواب: پروتئین کازئین

آب کافی بنوشید
حداقل ۳ لیتر آب در روز مصرف کنید.`,
      excerpt: "اصول تغذیه برای افزایش حجم عضلانی: کالری، پروتئین، کربوهیدرات و زمان‌بندی وعده‌ها",
      coverImage: "https://picsum.photos/seed/nutrition/800/400",
      category: "nutrition",
      readingTime: 8,
      likeCount: 89,
      viewCount: 450,
    },
    {
      authorId: coach2.userId,
      title: "۵ اشتباه رایج در تمرینات قدرتی",
      slug: "common-strength-training-mistakes-" + Date.now(),
      content: `بسیاری از افراد در تمرینات قدرتی اشتباهاتی انجام می‌دهند که مانع پیشرفت می‌شود. در این مقاله به ۵ اشتباه رایج می‌پردازیم.

۱. عدم گرم کردن کافی
گرم کردن قبل از تمرین ضروری است. ۵ تا ۱۰ دقیقه کاردیو سبک و حرکات کششی انجام دهید.

۲. فرم نادرست
فرم صحیح مهم‌تر از وزنه سنگین است. با وزنه سبک شروع کنید و فرم را یاد بگیرید.

۳. عدم استراحت کافی
عضلات در زمان استراحت رشد می‌کنند. حداقل ۴۸ ساعت به هر گروه عضلانی استراحت دهید.

۴. تغذیه نامناسب
بدون تغذیه مناسب، تمرین بی‌فایده است. پروتئین کافی مصرف کنید.

۵. عدم پیشرفت تدریجی
هر هفته سعی کنید کمی وزنه یا تکرار اضافه کنید.`,
      excerpt: "اشتباهات رایجی که مانع پیشرفت در تمرینات قدرتی می‌شوند",
      coverImage: "https://picsum.photos/seed/mistakes/800/400",
      category: "training",
      readingTime: 5,
      likeCount: 67,
      viewCount: 320,
    },
    {
      authorId: coach1.userId,
      title: "اهمیت خواب در ریکاوری عضلات",
      slug: "sleep-muscle-recovery-" + Date.now(),
      content: `خواب یکی از مهم‌ترین عوامل در ریکاوری و رشد عضلات است. در این مقاله به بررسی اهمیت خواب می‌پردازیم.

هورمون رشد
بیشترین ترشح هورمون رشد در خواب عمیق اتفاق می‌افتد. این هورمون برای ترمیم و رشد عضلات ضروری است.

ترمیم بافت‌ها
در زمان خواب، بدن بافت‌های آسیب‌دیده را ترمیم می‌کند.

چقدر بخوابیم؟
ورزشکاران به ۷ تا ۹ ساعت خواب نیاز دارند.

نکات بهبود کیفیت خواب:
- ساعت خواب منظم داشته باشید
- اتاق را تاریک و خنک نگه دارید
- از گوشی قبل از خواب استفاده نکنید
- کافئین را بعد از ظهر مصرف نکنید`,
      excerpt: "چرا خواب کافی برای رشد عضلات ضروری است؟",
      coverImage: "https://picsum.photos/seed/sleep/800/400",
      category: "recovery",
      readingTime: 4,
      likeCount: 45,
      viewCount: 210,
    },
    {
      authorId: coach2.userId,
      title: "چگونه انگیزه ورزشی خود را حفظ کنیم؟",
      slug: "stay-motivated-fitness-" + Date.now(),
      content: `حفظ انگیزه یکی از چالش‌های اصلی در مسیر تناسب اندام است. در این مقاله راهکارهایی برای حفظ انگیزه ارائه می‌دهیم.

اهداف واقع‌بینانه
اهداف کوچک و قابل دستیابی تعیین کنید. موفقیت‌های کوچک انگیزه‌بخش هستند.

پیشرفت را ثبت کنید
عکس‌های قبل و بعد بگیرید. اندازه‌گیری‌ها را یادداشت کنید.

شریک تمرینی
داشتن شریک تمرینی تعهد شما را افزایش می‌دهد.

تنوع در تمرین
برنامه تمرینی را هر چند هفته تغییر دهید تا خسته نشوید.

به خودتان پاداش دهید
با رسیدن به هر هدف، به خودتان پاداش دهید.`,
      excerpt: "راهکارهای عملی برای حفظ انگیزه در مسیر تناسب اندام",
      coverImage: "https://picsum.photos/seed/motivation/800/400",
      category: "motivation",
      readingTime: 5,
      likeCount: 78,
      viewCount: 380,
    },
  ]);

  console.log("✅ Articles created");
  console.log("🎉 Education seeding completed!");

  await pool.end();
}

seedEducation().catch(console.error);
