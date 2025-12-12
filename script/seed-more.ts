import { db } from "../server/db";
import { users, programs, reviews } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedMore() {
    console.log("🌱 Adding more programs and reviews...");

    // Get coaches
    const coaches = await db.select().from(users).where(eq(users.role, "coach"));
    const regularUsers = await db.select().from(users).where(eq(users.role, "user"));

    if (coaches.length < 3 || regularUsers.length < 3) {
        console.error("❌ Not enough coaches or users. Run seed.ts first.");
        process.exit(1);
    }

    // More programs for Coach 1 (Ali)
    await db.insert(programs).values([
        {
            coachId: coaches[0].id,
            title: "برنامه مبتدی ۴ هفته‌ای",
            description: "شروع قدرتمند برای تازه‌کارها",
            difficulty: "beginner",
            durationWeeks: 4,
            price: "1200000",
            isPublic: true,
        },
        {
            coachId: coaches[0].id,
            title: "برنامه کات حرفه‌ای",
            description: "کاهش چربی با حفظ عضله",
            difficulty: "advanced",
            durationWeeks: 10,
            price: "3000000",
            isPublic: true,
        },
        {
            coachId: coaches[0].id,
            title: "برنامه قدرتی ۶ هفته‌ای",
            description: "افزایش رکوردهای قدرتی",
            difficulty: "intermediate",
            durationWeeks: 6,
            price: "2000000",
            isPublic: true,
        },
    ]);

    // More programs for Coach 2 (Sara)
    await db.insert(programs).values([
        {
            coachId: coaches[1].id,
            title: "فیتنس بانوان",
            description: "برنامه اختصاصی برای خانم‌ها",
            difficulty: "beginner",
            durationWeeks: 8,
            price: "1500000",
            isPublic: true,
        },
        {
            coachId: coaches[1].id,
            title: "یوگا و انعطاف",
            description: "بهبود انعطاف‌پذیری و آرامش",
            difficulty: "beginner",
            durationWeeks: 6,
            price: "1000000",
            isPublic: true,
        },
        {
            coachId: coaches[1].id,
            title: "HIIT چربی‌سوز",
            description: "تمرینات اینتروال با شدت بالا",
            difficulty: "intermediate",
            durationWeeks: 4,
            price: "1300000",
            isPublic: true,
        },
    ]);

    // More programs for Coach 3 (Reza)
    await db.insert(programs).values([
        {
            coachId: coaches[2].id,
            title: "پاورلیفتینگ مبتدی",
            description: "آموزش سه حرکت اصلی",
            difficulty: "beginner",
            durationWeeks: 8,
            price: "2200000",
            isPublic: true,
        },
        {
            coachId: coaches[2].id,
            title: "برنامه مسابقات",
            description: "آمادگی برای مسابقات پاورلیفتینگ",
            difficulty: "expert",
            durationWeeks: 12,
            price: "4500000",
            isPublic: true,
        },
        {
            coachId: coaches[2].id,
            title: "ددلیفت ۲۰۰ کیلو",
            description: "برنامه تخصصی افزایش رکورد ددلیفت",
            difficulty: "advanced",
            durationWeeks: 10,
            price: "3200000",
            isPublic: true,
        },
    ]);

    console.log("✅ Programs added");

    // Reviews for Coach 1 (Ali)
    await db.insert(reviews).values([
        {
            coachId: coaches[0].id,
            userId: regularUsers[0].id,
            rating: 5,
            content: "عالی بود! ۱۰ کیلو عضله اضافه کردم. مربی خیلی حرفه‌ای و دلسوز.",
        },
        {
            coachId: coaches[0].id,
            userId: regularUsers[1].id,
            rating: 5,
            content: "برنامه‌هاش خیلی اصولی و علمی هستن. پشتیبانی عالی.",
        },
        {
            coachId: coaches[0].id,
            userId: regularUsers[2].id,
            rating: 4,
            content: "راضی بودم. فقط کاش ویدیوهای بیشتری داشت.",
        },
    ]);

    // Reviews for Coach 2 (Sara)
    await db.insert(reviews).values([
        {
            coachId: coaches[1].id,
            userId: regularUsers[0].id,
            rating: 5,
            content: "بهترین مربی برای کاهش وزن! ۸ کیلو کم کردم بدون گرسنگی.",
        },
        {
            coachId: coaches[1].id,
            userId: regularUsers[1].id,
            rating: 5,
            content: "خانم محمدی فوق‌العاده‌ان. برنامه غذایی‌شون معرکه بود.",
        },
        {
            coachId: coaches[1].id,
            userId: regularUsers[2].id,
            rating: 5,
            content: "خیلی صبور و مهربون. همیشه جواب سوالاتم رو میدن.",
        },
    ]);

    // Reviews for Coach 3 (Reza)
    await db.insert(reviews).values([
        {
            coachId: coaches[2].id,
            userId: regularUsers[0].id,
            rating: 5,
            content: "رکورد اسکاتم ۴۰ کیلو رفت بالا! مربی واقعی قدرت.",
        },
        {
            coachId: coaches[2].id,
            userId: regularUsers[1].id,
            rating: 4,
            content: "برنامه‌هاش سخت ولی نتیجه‌بخشه. برای حرفه‌ای‌ها عالیه.",
        },
        {
            coachId: coaches[2].id,
            userId: regularUsers[2].id,
            rating: 5,
            content: "آقای کریمی استاد پاورلیفتینگه. تکنیک‌هام خیلی بهتر شد.",
        },
    ]);

    console.log("✅ Reviews added");

    console.log("\n🎉 Done!");
    process.exit(0);
}

seedMore().catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
});
