import { db } from "../server/db";
import { users, reviews, questions, answers, posts, progressPhotos, progressMetrics, coachProfiles } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const athleteNames = [
    { name: "امیرحسین موسوی", username: "amirhossein_m", gender: "male" },
    { name: "فاطمه زهرا احمدی", username: "fatemeh_a", gender: "female" },
    { name: "محمدرضا کریمی", username: "mohammadreza_k", gender: "male" },
    { name: "زهرا محمدی", username: "zahra_m", gender: "female" },
    { name: "علیرضا حسینی", username: "alireza_h", gender: "male" },
    { name: "مریم رضایی", username: "maryam_r", gender: "female" },
    { name: "حسین نوری", username: "hossein_n", gender: "male" },
    { name: "سارا کاظمی", username: "sara_k", gender: "female" },
    { name: "مهدی جعفری", username: "mehdi_j", gender: "male" },
    { name: "نرگس علیزاده", username: "narges_a", gender: "female" },
    { name: "رضا صادقی", username: "reza_s", gender: "male" },
    { name: "لیلا حیدری", username: "leila_h", gender: "female" },
    { name: "سعید رحیمی", username: "saeed_r", gender: "male" },
    { name: "آیدا نجفی", username: "aida_n", gender: "female" },
    { name: "پویا اکبری", username: "pouya_a", gender: "male" },
    { name: "شیما قاسمی", username: "shima_gh", gender: "female" },
    { name: "کیان مرادی", username: "kian_m", gender: "male" },
    { name: "نیلوفر یوسفی", username: "niloofar_y", gender: "female" },
    { name: "آرش خسروی", username: "arash_kh", gender: "male" },
    { name: "پریسا امینی", username: "parisa_a", gender: "female" },
    { name: "بهنام توکلی", username: "behnam_t", gender: "male" },
    { name: "هانیه صالحی", username: "hanieh_s", gender: "female" },
    { name: "امین محمودی", username: "amin_m", gender: "male" },
    { name: "مهسا کرمی", username: "mahsa_k", gender: "female" },
    { name: "یاسر عباسی", username: "yaser_a", gender: "male" },
    { name: "سمیرا حسنی", username: "samira_h", gender: "female" },
    { name: "نیما رستمی", username: "nima_r", gender: "male" },
    { name: "الهام شریفی", username: "elham_sh", gender: "female" },
    { name: "سینا قربانی", username: "sina_gh", gender: "male" },
    { name: "ریحانه طاهری", username: "reyhaneh_t", gender: "female" },
    { name: "دانیال فرهادی", username: "danial_f", gender: "male" },
    { name: "غزل میرزایی", username: "ghazal_m", gender: "female" },
    { name: "شایان کمالی", username: "shayan_k", gender: "male" },
];

const reviewTexts = [
    "مربی فوق‌العاده‌ای هستن! برنامه‌هاشون خیلی اصولی و علمیه.",
    "خیلی راضی بودم. نتیجه‌ای که گرفتم عالی بود.",
    "پشتیبانی عالی و همیشه در دسترس. ممنون از زحماتشون.",
    "برنامه غذایی و تمرینی که دادن خیلی کمکم کرد.",
    "حرفه‌ای‌ترین مربی که تا حالا باهاش کار کردم.",
    "صبور و دلسوز. همیشه جواب سوالاتم رو میدن.",
    "۱۰ کیلو کم کردم توی ۳ ماه! معرکه بود.",
    "تکنیک‌هام خیلی بهتر شد. ممنون استاد.",
    "قیمتش مناسبه نسبت به کیفیتی که میده.",
    "به همه دوستام معرفیش کردم. واقعاً ارزشش رو داره.",
];

const questionData = [
    { title: "بهترین زمان برای تمرین چه ساعتیه؟", content: "صبح تمرین کنم بهتره یا عصر؟ کدوم نتیجه بهتری داره؟", category: "training" },
    { title: "چقدر پروتئین در روز نیاز دارم؟", content: "وزنم ۷۵ کیلوئه و میخوام عضله بسازم. روزی چند گرم پروتئین بخورم؟", category: "nutrition" },
    { title: "کراتین عوارض داره؟", content: "میخوام کراتین مصرف کنم ولی نگران عوارضشم. کسی تجربه داره؟", category: "supplements" },
    { title: "درد زانو بعد از اسکات", content: "هر وقت اسکات میزنم زانوم درد میگیره. مشکل از کجاست؟", category: "injury" },
    { title: "چطور شکم شش تکه بزنم؟", content: "۶ ماهه تمرین میکنم ولی هنوز شکمم معلوم نیست. چیکار کنم؟", category: "training" },
    { title: "تفاوت وی پروتئین و کازئین؟", content: "کدوم پروتئین برای بعد تمرین بهتره؟ وی یا کازئین؟", category: "supplements" },
    { title: "رژیم کتو خوبه؟", content: "میخوام رژیم کتوژنیک بگیرم. تجربه کسی هست؟", category: "nutrition" },
    { title: "چند روز در هفته تمرین کنم؟", content: "تازه‌کارم. ۳ روز کافیه یا بیشتر برم؟", category: "training" },
    { title: "بهترین حرکت برای سینه؟", content: "میخوام سینه‌ام رشد کنه. چه حرکاتی پیشنهاد میدید؟", category: "training" },
    { title: "آب کافی چقدره؟", content: "روزی چند لیتر آب بخورم برای بدنسازی؟", category: "nutrition" },
];

const answerTexts = [
    "تجربه من نشون داده صبح زود بهترین زمانه چون انرژی بیشتری داری.",
    "به نظرم عصر بهتره چون عضلات گرم‌ترن و ریسک آسیب کمتره.",
    "فرقی نداره، مهم اینه که مداوم باشی و برنامه‌ات رو رعایت کنی.",
    "من هر دو رو امتحان کردم، صبح برام بهتر جواب داد.",
    "طبق تحقیقات، ۱.۶ تا ۲.۲ گرم به ازای هر کیلو وزن بدن کافیه.",
    "من ۲ گرم به ازای هر کیلو میخورم و نتیجه خوبی گرفتم.",
    "کراتین یکی از امن‌ترین مکمل‌هاست. نگران نباش.",
    "احتمالاً فرم حرکتت مشکل داره. یه ویدیو بذار ببینیم.",
    "شکم شش تکه ۸۰٪ تغذیه‌ست. کالری‌هات رو کنترل کن.",
    "وی برای بعد تمرین بهتره چون سریع‌تر جذب میشه.",
];


async function seed() {
    console.log("🌱 Creating 33 athletes with activities...");

    const hashedPassword = await bcrypt.hash("123456", 10);

    // Get coaches for reviews
    const coaches = await db.select().from(coachProfiles);
    if (coaches.length === 0) {
        console.error("❌ No coaches found. Run seed.ts first.");
        process.exit(1);
    }

    // Create 33 athletes
    const athletes = await db.insert(users).values(
        athleteNames.map((a, i) => ({
            username: a.username,
            password: hashedPassword,
            fullName: a.name,
            email: `${a.username}@gmail.com`,
            phone: `0912${String(7000000 + i).padStart(7, '0')}`,
            role: "user" as const,
            gender: a.gender as "male" | "female",
            height: String(160 + Math.floor(Math.random() * 30)),
            weight: String(55 + Math.floor(Math.random() * 40)),
            bio: `ورزشکار علاقه‌مند به تناسب اندام 💪`,
        }))
    ).returning();

    console.log(`✅ Created ${athletes.length} athletes`);

    // Add reviews for coaches (15 athletes review coaches)
    const reviewers = athletes.slice(0, 15);
    const reviewsData = [];
    for (let i = 0; i < reviewers.length; i++) {
        const coach = coaches[i % coaches.length];
        reviewsData.push({
            coachId: coach.userId,
            userId: reviewers[i].id,
            rating: 4 + Math.floor(Math.random() * 2), // 4 or 5
            content: reviewTexts[i % reviewTexts.length],
        });
    }
    await db.insert(reviews).values(reviewsData);
    console.log(`✅ Created ${reviewsData.length} reviews`);

    // Create questions (10 athletes ask questions)
    const questioners = athletes.slice(0, 10);
    const createdQuestions = await db.insert(questions).values(
        questioners.map((u, i) => ({
            userId: u.id,
            title: questionData[i].title,
            content: questionData[i].content,
            category: questionData[i].category,
            voteCount: Math.floor(Math.random() * 30),
            answerCount: 0,
        }))
    ).returning();
    console.log(`✅ Created ${createdQuestions.length} questions`);

    // Create answers (other athletes answer questions)
    const answerers = athletes.slice(10, 30);
    const answersData = [];
    for (let i = 0; i < createdQuestions.length; i++) {
        const q = createdQuestions[i];
        // Each question gets 2-4 answers
        const numAnswers = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numAnswers; j++) {
            const answerer = answerers[(i * 3 + j) % answerers.length];
            answersData.push({
                questionId: q.id,
                userId: answerer.id,
                content: answerTexts[(i + j) % answerTexts.length],
                isBestAnswer: j === 0, // First answer is best answer
                voteCount: Math.floor(Math.random() * 20),
            });
        }
    }
    await db.insert(answers).values(answersData);

    // Update answer counts
    for (const q of createdQuestions) {
        const count = answersData.filter(a => a.questionId === q.id).length;
        await db.update(questions).set({ answerCount: count }).where(eq(questions.id, q.id));
    }
    console.log(`✅ Created ${answersData.length} answers`);

    // Create posts for some athletes
    const posters = athletes.slice(5, 20);
    const postTexts = [
        "امروز یه تمرین سنگین سینه داشتم! 💪🔥",
        "بعد از ۳ ماه بالاخره به هدفم رسیدم! ممنون از همه 🙏",
        "صبح زود تمرین کردن یه حس دیگه داره ☀️",
        "رکورد ددلیفتم رو زدم! ۱۵۰ کیلو 🎉",
        "تغذیه سالم + تمرین منظم = نتیجه عالی ✅",
        "هفته اول رژیمم تموم شد. ۲ کیلو کم کردم!",
        "باشگاه رفتن اعتیاد شده برام 😅",
        "کسی برنامه خوب برای پا داره؟ 🦵",
        "امروز روز استراحته ولی دلم تنگ شده برای وزنه‌ها 😂",
        "به همه پیشنهاد میکنم ورزش رو شروع کنن. زندگیم عوض شد!",
    ];

    await db.insert(posts).values(
        posters.map((u, i) => ({
            userId: u.id,
            content: postTexts[i % postTexts.length],
            likeCount: Math.floor(Math.random() * 50),
            commentCount: Math.floor(Math.random() * 10),
        }))
    );
    console.log(`✅ Created ${posters.length} posts`);


    // Create progress photos for athletes (20 athletes have progress photos)
    const progressUsers = athletes.slice(0, 20);
    const progressPhotosData = [];
    for (const user of progressUsers) {
        // Each user has 3-5 progress photos over time
        const numPhotos = 3 + Math.floor(Math.random() * 3);
        const startWeight = 70 + Math.floor(Math.random() * 20);
        const startBodyFat = 20 + Math.floor(Math.random() * 10);

        for (let i = 0; i < numPhotos; i++) {
            const daysAgo = (numPhotos - i) * 30; // One photo per month
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            progressPhotosData.push({
                userId: user.id,
                imageUrl: `https://picsum.photos/seed/${user.id}-${i}/400/600`,
                weight: String(startWeight - (i * 2)), // Losing 2kg per month
                bodyFat: String(startBodyFat - (i * 1.5)), // Losing 1.5% body fat per month
                notes: i === 0 ? "شروع برنامه" : i === numPhotos - 1 ? "نتیجه نهایی! 🎉" : `ماه ${i + 1}`,
                createdAt: date,
            });
        }
    }
    await db.insert(progressPhotos).values(progressPhotosData);
    console.log(`✅ Created ${progressPhotosData.length} progress photos`);

    // Create progress metrics for athletes (weight, body fat tracking)
    const metricsData = [];
    for (const user of progressUsers) {
        const startWeight = 70 + Math.floor(Math.random() * 20);
        const startBodyFat = 20 + Math.floor(Math.random() * 10);

        // 12 weeks of data
        for (let week = 0; week < 12; week++) {
            const daysAgo = (12 - week) * 7;
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            // Weight metric
            metricsData.push({
                userId: user.id,
                metricType: "weight",
                value: String(startWeight - (week * 0.5)), // Losing 0.5kg per week
                unit: "kg",
                recordedAt: date,
            });

            // Body fat metric
            metricsData.push({
                userId: user.id,
                metricType: "bodyFat",
                value: String(startBodyFat - (week * 0.3)), // Losing 0.3% per week
                unit: "%",
                recordedAt: date,
            });

            // Muscle mass metric (increasing)
            metricsData.push({
                userId: user.id,
                metricType: "muscleMass",
                value: String(30 + (week * 0.2)), // Gaining 0.2kg muscle per week
                unit: "kg",
                recordedAt: date,
            });
        }
    }
    await db.insert(progressMetrics).values(metricsData);
    console.log(`✅ Created ${metricsData.length} progress metrics`);

    console.log("\n🎉 All done! 33 athletes created with full activities.");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
