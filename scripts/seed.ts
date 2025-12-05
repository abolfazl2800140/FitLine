import "dotenv/config";
import { db, pool } from "./local-db";
import { users, coachProfiles, programs, workoutDays, exercises, supplements, challenges, badges, posts, questions } from "../shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("🌱 Seeding database...");

    // Create users
    const hashedPassword = await bcrypt.hash("123456", 10);

    const [admin] = await db.insert(users).values({
        email: "admin@fitline.com",
        username: "admin",
        password: hashedPassword,
        fullName: "مدیر سیستم",
        role: "admin",
        gender: "male",
        height: "180",
        weight: "85",
    }).returning();

    const [coach1] = await db.insert(users).values({
        email: "ali.coach@fitline.com",
        username: "ali_coach",
        password: hashedPassword,
        fullName: "علی احمدی",
        role: "coach",
        gender: "male",
        bio: "مربی بدنسازی با ۱۰ سال سابقه",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    }).returning();

    const [coach2] = await db.insert(users).values({
        email: "sara.coach@fitline.com",
        username: "sara_fit",
        password: hashedPassword,
        fullName: "سارا محمدی",
        role: "coach",
        gender: "female",
        bio: "متخصص تغذیه و فیتنس بانوان",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    }).returning();

    const [user1] = await db.insert(users).values({
        email: "reza@gmail.com",
        username: "reza_fit",
        password: hashedPassword,
        fullName: "رضا کریمی",
        role: "user",
        gender: "male",
        height: "175",
        weight: "78",
        bodyFat: "18",
        avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    }).returning();

    const [user2] = await db.insert(users).values({
        email: "mina@gmail.com",
        username: "mina_health",
        password: hashedPassword,
        fullName: "مینا رضایی",
        role: "user",
        gender: "female",
        height: "165",
        weight: "58",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    }).returning();

    const [user3] = await db.insert(users).values({
        email: "amir@gmail.com",
        username: "amir_power",
        password: hashedPassword,
        fullName: "امیر حسینی",
        role: "user",
        gender: "male",
        height: "182",
        weight: "90",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    }).returning();

    console.log("✅ Users created");

    // Create coach profiles
    await db.insert(coachProfiles).values([
        {
            userId: coach1.id,
            specialty: "بدنسازی و افزایش حجم",
            experience: 10,
            pricePerSession: "500000",
            credentials: "مدرک مربیگری درجه یک از فدراسیون بدنسازی",
            about: "با بیش از ۱۰ سال تجربه در زمینه بدنسازی و تناسب اندام، آماده کمک به شما برای رسیدن به اهدافتان هستم.",
            clientCount: 150,
            rating: "4.8",
            reviewCount: 89,
            isVerified: true,
        },
        {
            userId: coach2.id,
            specialty: "فیتنس بانوان و تغذیه",
            experience: 7,
            pricePerSession: "450000",
            credentials: "کارشناس تغذیه و مربی فیتنس",
            about: "متخصص در برنامه‌های ورزشی و تغذیه‌ای مخصوص بانوان",
            clientCount: 200,
            rating: "4.9",
            reviewCount: 124,
            isVerified: true,
        },
    ]);

    console.log("✅ Coach profiles created");


    // Create programs
    const [program1] = await db.insert(programs).values({
        coachId: coach1.id,
        title: "برنامه افزایش حجم ۱۲ هفته‌ای",
        description: "برنامه جامع برای افزایش حجم عضلانی با تمرینات سنگین و تغذیه مناسب",
        difficulty: "intermediate",
        durationWeeks: 12,
        price: "2500000",
        isPublic: true,
        coverImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    }).returning();

    const [program2] = await db.insert(programs).values({
        coachId: coach2.id,
        title: "چربی‌سوزی و تناسب اندام",
        description: "برنامه ۸ هفته‌ای برای کاهش چربی و رسیدن به تناسب اندام ایده‌آل",
        difficulty: "beginner",
        durationWeeks: 8,
        price: "1800000",
        isPublic: true,
        coverImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
    }).returning();

    const [program3] = await db.insert(programs).values({
        coachId: coach1.id,
        title: "قدرتی پیشرفته",
        description: "برنامه تخصصی برای افزایش قدرت در حرکات اصلی",
        difficulty: "advanced",
        durationWeeks: 16,
        price: "3500000",
        isPublic: true,
        coverImage: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800",
    }).returning();

    console.log("✅ Programs created");

    // Create workout days for program1
    const [day1] = await db.insert(workoutDays).values({
        programId: program1.id,
        weekNumber: 1,
        dayNumber: 1,
        title: "سینه و جلو بازو",
        description: "تمرین سنگین سینه همراه با جلو بازو",
    }).returning();

    const [day2] = await db.insert(workoutDays).values({
        programId: program1.id,
        weekNumber: 1,
        dayNumber: 2,
        title: "پشت و پشت بازو",
        description: "تمرین کامل عضلات پشت و پشت بازو",
    }).returning();

    const [day3] = await db.insert(workoutDays).values({
        programId: program1.id,
        weekNumber: 1,
        dayNumber: 3,
        title: "پا و شکم",
        description: "تمرین سنگین پا همراه با تمرینات شکم",
    }).returning();

    console.log("✅ Workout days created");


    // Create exercises
    await db.insert(exercises).values([
        { workoutDayId: day1.id, name: "پرس سینه با هالتر", sets: 4, reps: "8-10", restSeconds: 90, orderIndex: 1 },
        { workoutDayId: day1.id, name: "پرس سینه دمبل شیب‌دار", sets: 3, reps: "10-12", restSeconds: 75, orderIndex: 2 },
        { workoutDayId: day1.id, name: "فلای سینه با دستگاه", sets: 3, reps: "12-15", restSeconds: 60, orderIndex: 3 },
        { workoutDayId: day1.id, name: "جلو بازو با هالتر", sets: 4, reps: "10-12", restSeconds: 60, orderIndex: 4 },
        { workoutDayId: day1.id, name: "جلو بازو چکشی", sets: 3, reps: "12", restSeconds: 45, orderIndex: 5 },

        { workoutDayId: day2.id, name: "زیربغل با هالتر خم", sets: 4, reps: "8-10", restSeconds: 90, orderIndex: 1 },
        { workoutDayId: day2.id, name: "لت از جلو", sets: 4, reps: "10-12", restSeconds: 75, orderIndex: 2 },
        { workoutDayId: day2.id, name: "کابل کراس", sets: 3, reps: "12-15", restSeconds: 60, orderIndex: 3 },
        { workoutDayId: day2.id, name: "پشت بازو با سیم‌کش", sets: 4, reps: "12", restSeconds: 60, orderIndex: 4 },
        { workoutDayId: day2.id, name: "پشت بازو دمبل تک‌دست", sets: 3, reps: "12", restSeconds: 45, orderIndex: 5 },

        { workoutDayId: day3.id, name: "اسکات با هالتر", sets: 4, reps: "8-10", restSeconds: 120, orderIndex: 1 },
        { workoutDayId: day3.id, name: "پرس پا", sets: 4, reps: "10-12", restSeconds: 90, orderIndex: 2 },
        { workoutDayId: day3.id, name: "لانگ با دمبل", sets: 3, reps: "12 هر پا", restSeconds: 75, orderIndex: 3 },
        { workoutDayId: day3.id, name: "ساق پا ایستاده", sets: 4, reps: "15-20", restSeconds: 45, orderIndex: 4 },
        { workoutDayId: day3.id, name: "کرانچ شکم", sets: 3, reps: "20", restSeconds: 30, orderIndex: 5 },
    ]);

    console.log("✅ Exercises created");

    // Create supplements
    await db.insert(supplements).values([
        {
            name: "وی پروتئین گلد استاندارد",
            brand: "اپتیموم نوتریشن",
            description: "پروتئین وی با کیفیت بالا برای رشد عضلات",
            price: "3500000",
            originalPrice: "4000000",
            category: "پروتئین",
            stock: 50,
            rating: "4.8",
            reviewCount: 234,
            image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
        },
        {
            name: "کراتین مونوهیدرات",
            brand: "ماسل‌تک",
            description: "کراتین خالص برای افزایش قدرت و حجم",
            price: "850000",
            category: "کراتین",
            stock: 100,
            rating: "4.7",
            reviewCount: 156,
            image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400",
        },
        {
            name: "بی‌سی‌ای‌ای ۲:۱:۱",
            brand: "اکستند",
            description: "آمینو اسید شاخه‌دار برای ریکاوری سریع",
            price: "1200000",
            category: "آمینو اسید",
            stock: 75,
            rating: "4.6",
            reviewCount: 89,
            image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400",
        },
        {
            name: "پری‌ورک‌اوت C4",
            brand: "سلوکور",
            description: "انرژی‌زا قبل از تمرین برای عملکرد بهتر",
            price: "1800000",
            originalPrice: "2100000",
            category: "پری‌ورک‌اوت",
            stock: 40,
            rating: "4.5",
            reviewCount: 178,
            image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=400",
        },
        {
            name: "مولتی ویتامین ورزشی",
            brand: "اپتی‌من",
            description: "ویتامین کامل مخصوص ورزشکاران",
            price: "950000",
            category: "ویتامین",
            stock: 120,
            rating: "4.9",
            reviewCount: 312,
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
        },
    ]);

    console.log("✅ Supplements created");


    // Create challenges
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(challenges).values([
        {
            title: "چالش ۱۰۰ شنا در روز",
            description: "هر روز ۱۰۰ شنا انجام بده و قوی‌تر شو!",
            type: "weekly",
            goal: "انجام ۱۰۰ شنا روزانه",
            targetValue: 700,
            startDate: now,
            endDate: nextWeek,
            participantCount: 156,
            coverImage: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800",
        },
        {
            title: "چالش کاهش وزن ماهانه",
            description: "در یک ماه ۳ کیلو وزن کم کن",
            type: "monthly",
            goal: "کاهش ۳ کیلوگرم وزن",
            targetValue: 3,
            startDate: now,
            endDate: nextMonth,
            participantCount: 89,
            coverImage: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800",
        },
        {
            title: "چالش ۱۰ هزار قدم",
            description: "هر روز ۱۰ هزار قدم راه برو",
            type: "weekly",
            goal: "۱۰,۰۰۰ قدم روزانه",
            targetValue: 70000,
            startDate: now,
            endDate: nextWeek,
            participantCount: 234,
            coverImage: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800",
        },
    ]);

    console.log("✅ Challenges created");

    // Create badges
    await db.insert(badges).values([
        { name: "تازه‌کار", description: "اولین تمرین خود را انجام دادید", icon: "🌟", category: "شروع" },
        { name: "پایدار", description: "۷ روز متوالی تمرین کردید", icon: "🔥", category: "استمرار" },
        { name: "قهرمان", description: "۳۰ روز متوالی تمرین کردید", icon: "🏆", category: "استمرار" },
        { name: "اجتماعی", description: "۱۰ پست منتشر کردید", icon: "💬", category: "اجتماعی" },
        { name: "الهام‌بخش", description: "۱۰۰ لایک دریافت کردید", icon: "❤️", category: "اجتماعی" },
        { name: "چالش‌گر", description: "اولین چالش را تکمیل کردید", icon: "🎯", category: "چالش" },
        { name: "قدرتمند", description: "رکورد شخصی خود را شکستید", icon: "💪", category: "پیشرفت" },
        { name: "متعهد", description: "یک برنامه کامل را تمام کردید", icon: "✅", category: "برنامه" },
    ]);

    console.log("✅ Badges created");


    // Create posts
    await db.insert(posts).values([
        {
            userId: user1.id,
            content: "امروز بهترین تمرین سینه‌ام رو داشتم! 💪 رکورد پرس سینه رو شکستم و به ۱۰۰ کیلو رسیدم. ممنون از مربی عالیم @ali_coach",
            likeCount: 45,
            commentCount: 12,
            images: ["https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600"],
        },
        {
            userId: user2.id,
            content: "بعد از ۲ ماه تمرین منظم، ۵ کیلو وزن کم کردم! 🎉 هیچوقت فکر نمی‌کردم بتونم این کار رو بکنم. به همه توصیه می‌کنم شروع کنید!",
            likeCount: 89,
            commentCount: 23,
            images: [],
        },
        {
            userId: coach1.id,
            content: "نکته مهم برای افزایش حجم: پروتئین کافی بخورید! حداقل ۲ گرم به ازای هر کیلو وزن بدن. سوالی داشتید بپرسید 🥩🍗",
            likeCount: 156,
            commentCount: 34,
            images: [],
        },
        {
            userId: user3.id,
            content: "اولین روز تمرینم بود. سخت بود ولی حس خوبی دارم! 🏋️",
            likeCount: 23,
            commentCount: 8,
            images: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"],
        },
        {
            userId: coach2.id,
            content: "برنامه جدید چربی‌سوزی رو آپلود کردم! ۸ هفته‌ای و مناسب مبتدی‌ها. لینک در بیو 🔥",
            likeCount: 78,
            commentCount: 19,
            images: [],
        },
    ]);

    console.log("✅ Posts created");

    // Create questions
    await db.insert(questions).values([
        {
            userId: user1.id,
            title: "بهترین زمان مصرف پروتئین چه موقع است؟",
            content: "سلام، می‌خواستم بدونم بهترین زمان برای خوردن پروتئین وی قبل از تمرینه یا بعدش؟",
            category: "تغذیه",
            voteCount: 15,
            answerCount: 4,
        },
        {
            userId: user2.id,
            title: "چطور انگیزه‌ام رو حفظ کنم؟",
            content: "بعد از چند هفته تمرین، انگیزه‌ام کم شده. چطور می‌تونم ادامه بدم؟",
            category: "انگیزشی",
            voteCount: 32,
            answerCount: 7,
        },
        {
            userId: user3.id,
            title: "تفاوت کراتین و پروتئین چیه؟",
            content: "تازه شروع کردم و نمی‌دونم کدوم مکمل رو بخرم. لطفا راهنمایی کنید.",
            category: "مکمل",
            voteCount: 28,
            answerCount: 5,
        },
    ]);

    console.log("✅ Questions created");

    console.log("\n🎉 Database seeded successfully!");
    await pool.end();
    process.exit(0);
}

seed().catch(async (err) => {
    console.error("❌ Seed failed:", err);
    await pool.end();
    process.exit(1);
});
