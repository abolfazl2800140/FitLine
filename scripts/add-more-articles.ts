import "dotenv/config";
import { db, pool } from "./local-db";
import { articles, users, coachProfiles } from "../shared/schema";
import { eq } from "drizzle-orm";

async function addMoreArticles() {
  console.log("📝 Adding more articles...");

  const verifiedCoaches = await db
    .select({ userId: coachProfiles.userId })
    .from(coachProfiles)
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .where(eq(coachProfiles.isVerified, true))
    .limit(3);

  const coach1 = verifiedCoaches[0]?.userId;
  const coach2 = verifiedCoaches[1]?.userId || coach1;

  if (!coach1) {
    console.log("❌ No verified coaches found");
    await pool.end();
    return;
  }

  await db.insert(articles).values([
    {
      authorId: coach1,
      title: "راهنمای مکمل‌های ضروری برای ورزشکاران",
      slug: "essential-supplements-" + Date.now(),
      content: `مکمل‌ها می‌توانند به بهبود عملکرد ورزشی کمک کنند، اما کدام‌ها واقعاً ضروری هستند؟

پروتئین وی
بهترین منبع پروتئین برای ریکاوری سریع بعد از تمرین. ۲۰ تا ۳۰ گرم بعد از تمرین مصرف کنید.

کراتین مونوهیدرات
یکی از پرتحقیق‌ترین مکمل‌ها. قدرت و حجم عضلانی را افزایش می‌دهد. روزانه ۵ گرم کافی است.

امگا ۳
برای سلامت قلب و کاهش التهاب ضروری است. روزانه ۱ تا ۲ گرم EPA و DHA مصرف کنید.

ویتامین D
بسیاری از افراد کمبود دارند. برای سلامت استخوان و عضلات مهم است.

کافئین
انرژی و تمرکز را افزایش می‌دهد. ۳۰ دقیقه قبل از تمرین مصرف کنید.

نکته مهم: مکمل‌ها جایگزین تغذیه سالم نیستند!`,
      excerpt: "کدام مکمل‌ها برای ورزشکاران واقعاً مفید هستند؟",
      coverImage: "https://picsum.photos/seed/supplements/800/400",
      category: "supplements",
      readingTime: 6,
      likeCount: 56,
      viewCount: 290,
    },
    {
      authorId: coach2,
      title: "تمرین HIIT چیست و چرا باید انجامش دهید؟",
      slug: "hiit-training-guide-" + Date.now(),
      content: `HIIT یا تمرین تناوبی با شدت بالا، یکی از مؤثرترین روش‌های چربی‌سوزی است.

HIIT چیست؟
تناوب بین فعالیت شدید و استراحت کوتاه. مثلاً ۳۰ ثانیه دویدن سریع + ۳۰ ثانیه راه رفتن.

مزایای HIIT:
- چربی‌سوزی بیشتر در زمان کمتر
- افزایش متابولیسم تا ۲۴ ساعت بعد
- حفظ عضلات
- بهبود استقامت قلبی

یک برنامه ساده HIIT:
۱. گرم کردن: ۵ دقیقه
۲. ۳۰ ثانیه اسپرینت + ۳۰ ثانیه استراحت (۸ تا ۱۰ ست)
۳. سرد کردن: ۵ دقیقه

چند بار در هفته؟
۲ تا ۳ جلسه کافی است. بیشتر از این می‌تواند منجر به خستگی شود.`,
      excerpt: "آشنایی با تمرین تناوبی با شدت بالا و فواید آن",
      coverImage: "https://picsum.photos/seed/hiit/800/400",
      category: "training",
      readingTime: 5,
      likeCount: 72,
      viewCount: 340,
    },
    {
      authorId: coach1,
      title: "غذاهای قبل و بعد از تمرین",
      slug: "pre-post-workout-meals-" + Date.now(),
      content: `تغذیه قبل و بعد از تمرین تأثیر زیادی بر عملکرد و ریکاوری دارد.

قبل از تمرین (۱ تا ۲ ساعت قبل):
هدف: انرژی برای تمرین

غذاهای مناسب:
- موز با کره بادام‌زمینی
- جو دوسر با میوه
- نان سبوس‌دار با مرغ
- برنج با سبزیجات

بعد از تمرین (تا ۳۰ دقیقه بعد):
هدف: ریکاوری و رشد عضلات

غذاهای مناسب:
- شیک پروتئین با موز
- مرغ با برنج
- تخم‌مرغ با نان تست
- ماست یونانی با میوه

نکات مهم:
- آب کافی بنوشید
- از غذاهای چرب قبل از تمرین خودداری کنید
- پروتئین بعد از تمرین فراموش نشود`,
      excerpt: "چه بخوریم قبل و بعد از تمرین برای بهترین نتیجه؟",
      coverImage: "https://picsum.photos/seed/meals/800/400",
      category: "nutrition",
      readingTime: 4,
      likeCount: 63,
      viewCount: 310,
    },
    {
      authorId: coach2,
      title: "چگونه از آسیب‌دیدگی جلوگیری کنیم؟",
      slug: "injury-prevention-" + Date.now(),
      content: `آسیب‌دیدگی می‌تواند هفته‌ها یا ماه‌ها شما را از تمرین دور کند. پیشگیری بهتر از درمان است.

گرم کردن
همیشه ۵ تا ۱۰ دقیقه گرم کنید. کاردیو سبک و حرکات پویا انجام دهید.

فرم صحیح
فرم نادرست اصلی‌ترین علت آسیب است. با وزنه سبک شروع کنید.

پیشرفت تدریجی
هر هفته بیش از ۱۰٪ وزنه اضافه نکنید.

استراحت کافی
به بدن زمان ریکاوری بدهید. حداقل ۱ روز استراحت در هفته داشته باشید.

گوش دادن به بدن
درد غیرطبیعی را نادیده نگیرید. اگر درد دارید، استراحت کنید.

کشش و انعطاف‌پذیری
بعد از تمرین کشش انجام دهید. یوگا یا پیلاتس هم مفید است.`,
      excerpt: "نکات مهم برای جلوگیری از آسیب در تمرینات",
      coverImage: "https://picsum.photos/seed/injury/800/400",
      category: "recovery",
      readingTime: 5,
      likeCount: 48,
      viewCount: 220,
    },
    {
      authorId: coach1,
      title: "سبک زندگی سالم برای ورزشکاران",
      slug: "healthy-lifestyle-athletes-" + Date.now(),
      content: `موفقیت در ورزش فقط به تمرین محدود نمی‌شود. سبک زندگی کلی شما مهم است.

خواب با کیفیت
۷ تا ۹ ساعت خواب برای ریکاوری ضروری است. ساعت خواب منظم داشته باشید.

مدیریت استرس
استرس مزمن ریکاوری را مختل می‌کند. مدیتیشن یا تنفس عمیق تمرین کنید.

هیدراتاسیون
حداقل ۳ لیتر آب در روز. در روزهای تمرین بیشتر.

تغذیه متعادل
غذاهای فرآوری‌شده را کم کنید. سبزیجات و پروتئین کافی بخورید.

ثبات و پایداری
نتایج با ثبات می‌آیند. هر روز کمی بهتر از دیروز باشید.

تعادل کار و زندگی
ورزش مهم است اما همه چیز نیست. به خانواده و دوستان هم وقت بدهید.`,
      excerpt: "عادات روزانه که به موفقیت ورزشی کمک می‌کنند",
      coverImage: "https://picsum.photos/seed/lifestyle/800/400",
      category: "lifestyle",
      readingTime: 5,
      likeCount: 54,
      viewCount: 260,
    },
  ]);

  console.log("✅ 5 new articles added!");
  await pool.end();
}

addMoreArticles().catch(console.error);
