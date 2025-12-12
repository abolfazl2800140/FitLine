import { db } from "../server/db";
import { users, coachProfiles, programs, workoutDays, exercises, supplements, challenges, badges, posts, questions, answers } from "../shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("🌱 Seeding database...");

    // Hash password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Create Coaches
    const coachUsers = await db.insert(users).values([
        {
            username: "ali_coach",
            password: hashedPassword,
            fullName: "علی احمدی",
            email: "ali@fitline.com",
            phone: "09121111111",
            role: "coach",
            gender: "male",
            bio: "مربی بدنسازی با ۱۰ سال سابقه",
        },
        {
            username: "sara_coach",
            password: hashedPassword,
            fullName: "سارا محمدی",
            email: "sara@fitline.com",
            phone: "09122222222",
            role: "coach",
            gender: "female",
            bio: "متخصص تغذیه و فیتنس",
        },
        {
            username: "reza_coach",
            password: hashedPassword,
            fullName: "رضا کریمی",
            email: "reza@fitline.com",
            phone: "09123333333",
            role: "coach",
            gender: "male",
            bio: "قهرمان پرورش اندام",
        },
    ]).returning();

    console.log("✅ Coaches created");

    // Create Coach Profiles
    await db.insert(coachProfiles).values([
        {
            userId: coachUsers[0].id,
            specialty: "بدنسازی و حجم",
            experience: 10,
            pricePerSession: "500000",
            credentials: "مدرک فدراسیون بدنسازی",
            about: "متخصص در افزایش حجم عضلانی و قدرت",
            rating: "4.8",
            reviewCount: 45,
            isVerified: true,
        },
        {
            userId: coachUsers[1].id,
            specialty: "تناسب اندام و کاهش وزن",
            experience: 7,
            pricePerSession: "450000",
            credentials: "دکترای تغذیه ورزشی",
            about: "کمک به شما برای رسیدن به وزن ایده‌آل",
            rating: "4.9",
            reviewCount: 62,
            isVerified: true,
        },
        {
            userId: coachUsers[2].id,
            specialty: "پاورلیفتینگ",
            experience: 12,
            pricePerSession: "600000",
            credentials: "قهرمان کشوری پاورلیفتینگ",
            about: "آموزش تخصصی حرکات قدرتی",
            rating: "4.7",
            reviewCount: 38,
            isVerified: true,
        },
    ]);

    console.log("✅ Coach profiles created");

    // Create Regular Users
    const regularUsers = await db.insert(users).values([
        {
            username: "mohammad_user",
            password: hashedPassword,
            fullName: "محمد رضایی",
            email: "mohammad@gmail.com",
            phone: "09124444444",
            role: "user",
            gender: "male",
            height: "175",
            weight: "78",
        },
        {
            username: "maryam_user",
            password: hashedPassword,
            fullName: "مریم حسینی",
            email: "maryam@gmail.com",
            phone: "09125555555",
            role: "user",
            gender: "female",
            height: "165",
            weight: "58",
        },
        {
            username: "amir_user",
            password: hashedPassword,
            fullName: "امیر نوری",
            email: "amir@gmail.com",
            phone: "09126666666",
            role: "user",
            gender: "male",
            height: "180",
            weight: "85",
        },
    ]).returning();

    console.log("✅ Users created");

    // Create Programs
    const programsData = await db.insert(programs).values([
        {
            coachId: coachUsers[0].id,
            title: "برنامه حجم ۱۲ هفته‌ای",
            description: "برنامه کامل برای افزایش حجم عضلانی",
            difficulty: "intermediate",
            durationWeeks: 12,
            price: "2500000",
            isPublic: true,
        },
        {
            coachId: coachUsers[1].id,
            title: "چربی‌سوزی سریع",
            description: "برنامه ۸ هفته‌ای کاهش وزن",
            difficulty: "beginner",
            durationWeeks: 8,
            price: "1800000",
            isPublic: true,
        },
        {
            coachId: coachUsers[2].id,
            title: "قدرت محض",
            description: "برنامه پاورلیفتینگ پیشرفته",
            difficulty: "advanced",
            durationWeeks: 16,
            price: "3500000",
            isPublic: true,
        },
    ]).returning();

    console.log("✅ Programs created");

    // Create Workout Days for first program
    const workoutDaysData = await db.insert(workoutDays).values([
        { programId: programsData[0].id, weekNumber: 1, dayNumber: 1, title: "سینه و جلو بازو", description: "تمرین فشاری" },
        { programId: programsData[0].id, weekNumber: 1, dayNumber: 2, title: "پشت و پشت بازو", description: "تمرین کششی" },
        { programId: programsData[0].id, weekNumber: 1, dayNumber: 3, title: "پا و شکم", description: "تمرین پایین‌تنه" },
        { programId: programsData[0].id, weekNumber: 1, dayNumber: 4, title: "سرشانه و ساعد", description: "تمرین شانه" },
    ]).returning();

    console.log("✅ Workout days created");

    // Create Exercises
    await db.insert(exercises).values([
        { workoutDayId: workoutDaysData[0].id, name: "پرس سینه هالتر", sets: 4, reps: "10-12", restSeconds: 90, orderIndex: 1 },
        { workoutDayId: workoutDaysData[0].id, name: "پرس سینه دمبل شیب‌دار", sets: 3, reps: "12", restSeconds: 60, orderIndex: 2 },
        { workoutDayId: workoutDaysData[0].id, name: "کراس اور", sets: 3, reps: "15", restSeconds: 45, orderIndex: 3 },
        { workoutDayId: workoutDaysData[0].id, name: "جلو بازو هالتر", sets: 4, reps: "10", restSeconds: 60, orderIndex: 4 },
        { workoutDayId: workoutDaysData[1].id, name: "زیربغل سیم‌کش", sets: 4, reps: "12", restSeconds: 60, orderIndex: 1 },
        { workoutDayId: workoutDaysData[1].id, name: "بارفیکس", sets: 3, reps: "تا ناتوانی", restSeconds: 90, orderIndex: 2 },
        { workoutDayId: workoutDaysData[1].id, name: "پشت بازو سیم‌کش", sets: 4, reps: "12", restSeconds: 45, orderIndex: 3 },
        { workoutDayId: workoutDaysData[2].id, name: "اسکات", sets: 4, reps: "10", restSeconds: 120, orderIndex: 1 },
        { workoutDayId: workoutDaysData[2].id, name: "پرس پا", sets: 3, reps: "12", restSeconds: 90, orderIndex: 2 },
        { workoutDayId: workoutDaysData[2].id, name: "ددلیفت رومانیایی", sets: 3, reps: "10", restSeconds: 90, orderIndex: 3 },
    ]);

    console.log("✅ Exercises created");


    // Create Supplements
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
            reviewCount: 120,
        },
        {
            name: "کراتین مونوهیدرات",
            brand: "ماسل‌تک",
            description: "افزایش قدرت و حجم عضلانی",
            price: "850000",
            originalPrice: "950000",
            category: "کراتین",
            stock: 80,
            rating: "4.6",
            reviewCount: 85,
        },
        {
            name: "بی‌سی‌ای‌ای",
            brand: "اکستند",
            description: "آمینو اسیدهای شاخه‌دار برای ریکاوری",
            price: "1200000",
            category: "آمینو اسید",
            stock: 60,
            rating: "4.7",
            reviewCount: 65,
        },
        {
            name: "پری‌ورک‌اوت C4",
            brand: "سلوکور",
            description: "انرژی و تمرکز قبل از تمرین",
            price: "1800000",
            originalPrice: "2100000",
            category: "پری‌ورک‌اوت",
            stock: 40,
            rating: "4.5",
            reviewCount: 92,
        },
        {
            name: "گلوتامین",
            brand: "اپتیموم نوتریشن",
            description: "بهبود ریکاوری و سیستم ایمنی",
            price: "750000",
            category: "آمینو اسید",
            stock: 70,
            rating: "4.4",
            reviewCount: 48,
        },
    ]);

    console.log("✅ Supplements created");

    // Create Challenges
    await db.insert(challenges).values([
        {
            title: "چالش ۳۰ روز پلانک",
            description: "هر روز پلانک بزن و قوی‌تر شو",
            type: "monthly",
            goal: "۳۰ روز متوالی پلانک",
            targetValue: 30,
            startDate: new Date("2025-12-01"),
            endDate: new Date("2025-12-31"),
            participantCount: 156,
        },
        {
            title: "چالش هفتگی ۱۰۰ شنا",
            description: "این هفته ۱۰۰ شنا بزن",
            type: "weekly",
            goal: "۱۰۰ شنا در هفته",
            targetValue: 100,
            startDate: new Date("2025-12-09"),
            endDate: new Date("2025-12-15"),
            participantCount: 89,
        },
        {
            title: "چالش کاهش وزن",
            description: "۲ کیلو در ماه کم کن",
            type: "monthly",
            goal: "کاهش ۲ کیلوگرم",
            targetValue: 2,
            startDate: new Date("2025-12-01"),
            endDate: new Date("2025-12-31"),
            participantCount: 234,
        },
    ]);

    console.log("✅ Challenges created");

    // Create Badges
    await db.insert(badges).values([
        { name: "تازه‌کار", description: "اولین تمرین رو انجام دادی", icon: "🌟", category: "شروع" },
        { name: "پایدار", description: "۷ روز متوالی تمرین کردی", icon: "🔥", category: "تداوم" },
        { name: "قهرمان", description: "۳۰ روز متوالی تمرین کردی", icon: "🏆", category: "تداوم" },
        { name: "اجتماعی", description: "۱۰ پست منتشر کردی", icon: "💬", category: "اجتماعی" },
        { name: "یاری‌گر", description: "به ۵ سوال پاسخ دادی", icon: "🤝", category: "اجتماعی" },
        { name: "خریدار", description: "اولین خریدت رو انجام دادی", icon: "🛒", category: "فروشگاه" },
    ]);

    console.log("✅ Badges created");


    // Create Posts
    await db.insert(posts).values([
        {
            userId: coachUsers[0].id,
            content: "امروز یه تمرین عالی سینه داشتیم! 💪 بچه‌ها عالی کار کردن",
            likeCount: 45,
            commentCount: 12,
        },
        {
            userId: regularUsers[0].id,
            content: "بعد از ۳ ماه تمرین، ۵ کیلو عضله اضافه کردم! ممنون از مربیم 🙏",
            likeCount: 89,
            commentCount: 23,
        },
        {
            userId: coachUsers[1].id,
            content: "نکته مهم: آب کافی بخورید! حداقل ۸ لیوان در روز 💧",
            likeCount: 67,
            commentCount: 8,
        },
        {
            userId: regularUsers[1].id,
            content: "اولین روز باشگاهم بود، خیلی هیجان‌زده‌ام! 🎉",
            likeCount: 34,
            commentCount: 15,
        },
    ]);

    console.log("✅ Posts created");

    // Create Questions
    const questionsData = await db.insert(questions).values([
        {
            userId: regularUsers[0].id,
            title: "بهترین زمان مصرف پروتئین؟",
            content: "سلام، میخواستم بدونم بهترین زمان برای خوردن پروتئین وی چه زمانیه؟",
            category: "تغذیه",
            voteCount: 15,
            answerCount: 3,
        },
        {
            userId: regularUsers[1].id,
            title: "تفاوت کراتین مونو و HCL؟",
            content: "فرق این دو نوع کراتین چیه؟ کدوم بهتره؟",
            category: "مکمل",
            voteCount: 22,
            answerCount: 2,
        },
        {
            userId: regularUsers[2].id,
            title: "چطور شکم شش تکه بزنم؟",
            content: "۳ ماهه تمرین میکنم ولی هنوز شکمم معلوم نیست. چیکار کنم؟",
            category: "تمرین",
            voteCount: 45,
            answerCount: 5,
        },
    ]).returning();

    console.log("✅ Questions created");

    // Create Answers
    await db.insert(answers).values([
        {
            questionId: questionsData[0].id,
            userId: coachUsers[0].id,
            content: "بهترین زمان بلافاصله بعد از تمرین هست. ولی مهم‌تر از زمان، کل پروتئین روزانه‌ته.",
            isBestAnswer: true,
            voteCount: 12,
        },
        {
            questionId: questionsData[1].id,
            userId: coachUsers[1].id,
            content: "مونوهیدرات ارزون‌تر و تحقیقات بیشتری روش شده. HCL جذب بهتری داره ولی گرون‌تره.",
            voteCount: 8,
        },
        {
            questionId: questionsData[2].id,
            userId: coachUsers[2].id,
            content: "شکم شش تکه ۸۰٪ تغذیه‌ست! باید درصد چربی بدنت زیر ۱۲٪ بشه. کالری‌هات رو کنترل کن.",
            isBestAnswer: true,
            voteCount: 35,
        },
    ]);

    console.log("✅ Answers created");

    console.log("\n🎉 Seeding completed successfully!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
