import { db } from "./db";
import {
  users, coachProfiles, programs, workoutDays, exercises,
  posts, supplements, challenges, leagues, leagueMembers, badges,
  questions, answers
} from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Create sample users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const [user1] = await db.insert(users).values({
    email: "ali@example.com",
    username: "ali_coach",
    password: hashedPassword,
    fullName: "علی احمدی",
    avatar: null,
    bio: "مربی حرفه‌ای بدنسازی با ۱۰ سال سابقه",
    role: "coach",
    gender: "male",
    height: "180",
    weight: "85",
  }).returning();

  const [user2] = await db.insert(users).values({
    email: "sara@example.com",
    username: "sara_fit",
    password: hashedPassword,
    fullName: "سارا محمدی",
    avatar: null,
    bio: "متخصص تغذیه و فیتنس بانوان",
    role: "coach",
    gender: "female",
    height: "168",
    weight: "58",
  }).returning();

  const [user3] = await db.insert(users).values({
    email: "reza@example.com",
    username: "reza_power",
    password: hashedPassword,
    fullName: "رضا کریمی",
    avatar: null,
    bio: "مربی کراس‌فیت و قدرتی",
    role: "coach",
    gender: "male",
    height: "185",
    weight: "92",
  }).returning();

  const [user4] = await db.insert(users).values({
    email: "maryam@example.com",
    username: "maryam_yoga",
    password: hashedPassword,
    fullName: "مریم حسینی",
    avatar: null,
    bio: "مربی یوگا و مدیتیشن",
    role: "coach",
    gender: "female",
    height: "165",
    weight: "55",
  }).returning();

  const [regularUser] = await db.insert(users).values({
    email: "user@example.com",
    username: "fituser",
    password: hashedPassword,
    fullName: "کاربر تست",
    avatar: null,
    bio: "علاقه‌مند به فیتنس و سلامتی",
    role: "user",
    gender: "male",
    height: "175",
    weight: "78",
  }).returning();

  // Create coach profiles
  await db.insert(coachProfiles).values([
    {
      userId: user1.id,
      specialty: "بدنسازی",
      experience: 10,
      pricePerSession: "350000",
      credentials: "مربی درجه یک فدراسیون بدنسازی",
      about: "با ۱۰ سال تجربه در زمینه بدنسازی و تناسب اندام، به صدها نفر کمک کرده‌ام به اهداف خود برسند.",
      clientCount: 150,
      rating: "4.8",
      reviewCount: 89,
      isVerified: true,
    },
    {
      userId: user2.id,
      specialty: "فیتنس بانوان",
      experience: 7,
      pricePerSession: "280000",
      credentials: "لیسانس تربیت بدنی، مربی تغذیه",
      about: "متخصص در برنامه‌ریزی تمرینی و تغذیه‌ای برای بانوان با تمرکز بر کاهش وزن سالم.",
      clientCount: 200,
      rating: "4.9",
      reviewCount: 124,
      isVerified: true,
    },
    {
      userId: user3.id,
      specialty: "کراس‌فیت",
      experience: 8,
      pricePerSession: "400000",
      credentials: "مربی CrossFit Level 3",
      about: "تمرینات قدرتی و کراس‌فیت برای افزایش قدرت و استقامت.",
      clientCount: 95,
      rating: "4.7",
      reviewCount: 67,
      isVerified: true,
    },
    {
      userId: user4.id,
      specialty: "یوگا",
      experience: 12,
      pricePerSession: "250000",
      credentials: "مربی یوگا RYT-500",
      about: "یوگا و مدیتیشن برای آرامش ذهن و بدن.",
      clientCount: 180,
      rating: "4.9",
      reviewCount: 156,
      isVerified: true,
    },
  ]);

  // Create programs
  const [program1] = await db.insert(programs).values({
    coachId: user1.id,
    title: "برنامه حجم ۱۲ هفته‌ای",
    description: "برنامه جامع افزایش حجم عضلانی برای مبتدیان و متوسط",
    difficulty: "intermediate",
    durationWeeks: 12,
    price: "1500000",
    isPublic: true,
  }).returning();

  await db.insert(programs).values([
    {
      coachId: user2.id,
      title: "چالش کاهش وزن ۸ هفته‌ای",
      description: "برنامه فشرده کاهش وزن با تمرینات HIIT و تغذیه",
      difficulty: "beginner",
      durationWeeks: 8,
      price: "1200000",
      isPublic: true,
    },
    {
      coachId: user3.id,
      title: "قدرت و استقامت پیشرفته",
      description: "تمرینات سنگین برای ورزشکاران حرفه‌ای",
      difficulty: "advanced",
      durationWeeks: 16,
      price: "2000000",
      isPublic: true,
    },
    {
      coachId: user4.id,
      title: "یوگا برای مبتدیان",
      description: "آشنایی با یوگا و مدیتیشن از صفر تا صد",
      difficulty: "beginner",
      durationWeeks: 6,
      price: "800000",
      isPublic: true,
    },
  ]);

  // Create posts
  await db.insert(posts).values([
    {
      userId: user1.id,
      content: "تمرین امروز: پرس سینه ۴ ست ۱۲ تکرار 💪 فراموش نکنید که استراحت بین ست‌ها خیلی مهمه!",
      likeCount: 45,
      commentCount: 12,
    },
    {
      userId: user2.id,
      content: "صبحانه سالم = روز پرانرژی! امروز با اوملت سبزیجات و جو دوسر شروع کردم. شما چی خوردید؟",
      likeCount: 78,
      commentCount: 23,
    },
    {
      userId: regularUser.id,
      content: "بالاخره بعد از ۳ ماه تمرین، به هدفم رسیدم! ممنون از مربی عزیزم که راهنماییم کرد.",
      likeCount: 156,
      commentCount: 34,
    },
    {
      userId: user3.id,
      content: "چالش امروز: ۱۰۰ اسکات! کی میخواد امتحان کنه؟ 🔥",
      likeCount: 92,
      commentCount: 45,
    },
  ]);

  // Create supplements
  await db.insert(supplements).values([
    {
      name: "پروتئین وی گلد استاندارد",
      brand: "اپتیمم نوتریشن",
      description: "پروتئین با کیفیت بالا برای ریکاوری عضلات",
      price: "2500000",
      originalPrice: "2800000",
      category: "protein",
      stock: 50,
      rating: "4.8",
      reviewCount: 234,
    },
    {
      name: "BCAA ۲:۱:۱",
      brand: "ماسل تک",
      description: "آمینو اسید شاخه‌دار برای جلوگیری از کاتابولیسم",
      price: "1200000",
      originalPrice: "1400000",
      category: "bcaa",
      stock: 35,
      rating: "4.6",
      reviewCount: 156,
    },
    {
      name: "کراتین مونوهیدرات",
      brand: "ماسل فارم",
      description: "افزایش قدرت و حجم عضلات",
      price: "650000",
      originalPrice: null,
      category: "creatine",
      stock: 80,
      rating: "4.7",
      reviewCount: 189,
    },
    {
      name: "پری‌ورکات C4",
      brand: "سلوکور",
      description: "انرژی و تمرکز بالا قبل از تمرین",
      price: "1800000",
      originalPrice: "2100000",
      category: "preworkout",
      stock: 25,
      rating: "4.5",
      reviewCount: 98,
    },
    {
      name: "مولتی ویتامین مردانه",
      brand: "اوپتی‌من",
      description: "ویتامین‌های ضروری برای ورزشکاران",
      price: "950000",
      originalPrice: null,
      category: "vitamins",
      stock: 60,
      rating: "4.9",
      reviewCount: 312,
    },
    {
      name: "چربی‌سوز ترموجنیک",
      brand: "گت نوتریشن",
      description: "افزایش متابولیسم و سوزاندن چربی",
      price: "1450000",
      originalPrice: "1650000",
      category: "fatBurner",
      stock: 40,
      rating: "4.4",
      reviewCount: 87,
    },
  ]);

  // Create challenges
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await db.insert(challenges).values([
    {
      title: "چالش ۱۰۰ اسکات روزانه",
      description: "هر روز ۱۰۰ اسکات انجام بدید و پیشرفت کنید",
      type: "weekly",
      goal: "تکمیل ۱۰۰ اسکات در روز",
      targetValue: 700,
      startDate: new Date(),
      endDate: nextWeek,
      participantCount: 234,
    },
    {
      title: "ماراتن پلانک",
      description: "هر روز ۵ دقیقه پلانک - رکوردتون رو بشکنید",
      type: "weekly",
      goal: "۵ دقیقه پلانک روزانه",
      targetValue: 35,
      startDate: new Date(),
      endDate: nextWeek,
      participantCount: 189,
    },
    {
      title: "چالش تغذیه سالم",
      description: "یک ماه بدون شکر و فست فود",
      type: "monthly",
      goal: "۳۰ روز تغذیه سالم",
      targetValue: 30,
      startDate: new Date(),
      endDate: nextMonth,
      participantCount: 567,
    },
  ]);

  // Create current month league
  const now = new Date();
  const [league] = await db.insert(leagues).values({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    tier: "gold",
    isActive: true,
  }).returning();

  // Create questions
  await db.insert(questions).values([
    {
      userId: regularUser.id,
      title: "بهترین زمان مصرف پروتئین چه زمانی است؟",
      content: "سلام، من تازه شروع به بدنسازی کردم و نمیدونم پروتئین رو چه زمانی مصرف کنم. بعد از تمرین بهتره یا قبلش؟",
      category: "supplements",
      voteCount: 12,
      answerCount: 5,
    },
    {
      userId: regularUser.id,
      title: "چگونه از آسیب‌دیدگی زانو جلوگیری کنم؟",
      content: "موقع اسکات زانوهام درد میگیره. آیا روش خاصی برای محافظت از زانو وجود داره؟",
      category: "injury",
      voteCount: 25,
      answerCount: 8,
    },
    {
      userId: regularUser.id,
      title: "رژیم کتوژنیک برای لاغری خوبه؟",
      content: "در مورد رژیم کتو خیلی شنیدم. آیا برای کاهش وزن مناسبه؟ عوارضی نداره؟",
      category: "nutrition",
      voteCount: 34,
      answerCount: 12,
    },
  ]);

  // Get created questions
  const createdQuestions = await db.select().from(questions);

  // Create answers for questions
  if (createdQuestions.length > 0) {
    await db.insert(answers).values([
      // Answers for first question (protein timing)
      {
        questionId: createdQuestions[0].id,
        userId: coach1.id,
        content: "بهترین زمان مصرف پروتئین بلافاصله بعد از تمرین هست، چون عضلات در این زمان بیشترین نیاز رو به پروتئین دارن. این بازه زمانی رو \"پنجره آنابولیک\" میگن که حدود ۳۰ دقیقه تا ۲ ساعت بعد از تمرینه.",
        voteCount: 28,
        isBestAnswer: true,
      },
      {
        questionId: createdQuestions[0].id,
        userId: coach2.id,
        content: "علاوه بر بعد از تمرین، مصرف پروتئین قبل از خواب هم خیلی مفیده. پروتئین کازئین برای شب عالیه چون آهسته جذب میشه.",
        voteCount: 15,
        isBestAnswer: false,
      },
      {
        questionId: createdQuestions[0].id,
        userId: regularUser.id,
        content: "من شخصاً صبح‌ها هم یه اسکوپ پروتئین میزنم. حس میکنم انرژی بیشتری دارم.",
        voteCount: 5,
        isBestAnswer: false,
      },
      // Answers for second question (knee injury)
      {
        questionId: createdQuestions[1].id,
        userId: coach1.id,
        content: "برای محافظت از زانو:\n۱. حتماً گرم کردن قبل از تمرین\n۲. فرم صحیح اسکات (زانو از نوک پا جلوتر نره)\n۳. تقویت عضلات چهارسر و همسترینگ\n۴. استفاده از زانوبند در تمرینات سنگین",
        voteCount: 42,
        isBestAnswer: true,
      },
      {
        questionId: createdQuestions[1].id,
        userId: coach2.id,
        content: "اگه درد زانو ادامه داره، حتماً به یه فیزیوتراپ مراجعه کن. شاید مشکل از تکنیک نباشه و نیاز به درمان داشته باشی.",
        voteCount: 18,
        isBestAnswer: false,
      },
      // Answers for third question (keto diet)
      {
        questionId: createdQuestions[2].id,
        userId: coach2.id,
        content: "رژیم کتو برای کاهش وزن سریع مؤثره ولی چند نکته مهم:\n- اوایل ممکنه سردرد و خستگی داشته باشی (کتو فلو)\n- برای ورزشکاران حرفه‌ای توصیه نمیشه\n- بلندمدت ممکنه مشکلاتی ایجاد کنه\n- حتماً با متخصص تغذیه مشورت کن",
        voteCount: 35,
        isBestAnswer: true,
      },
      {
        questionId: createdQuestions[2].id,
        userId: coach1.id,
        content: "به نظرم رژیم متعادل با کسری کالری بهتر از کتوئه. پایدارتره و عوارض کمتری داره.",
        voteCount: 22,
        isBestAnswer: false,
      },
    ]);
  }

  // Create badges
  await db.insert(badges).values([
    { name: "اولین تمرین", description: "اولین تمرین خود را تکمیل کردید", icon: "dumbbell", category: "شروع" },
    { name: "۷ روز متوالی", description: "۷ روز متوالی تمرین کردید", icon: "fire", category: "تداوم" },
    { name: "۳۰ روز متوالی", description: "۳۰ روز متوالی تمرین کردید", icon: "trophy", category: "تداوم" },
    { name: "اولین پست", description: "اولین پست خود را منتشر کردید", icon: "message", category: "اجتماعی" },
    { name: "۱۰۰ لایک", description: "۱۰۰ لایک دریافت کردید", icon: "heart", category: "اجتماعی" },
    { name: "۱۰ کیلو کاهش وزن", description: "۱۰ کیلوگرم کاهش وزن داشتید", icon: "scale", category: "پیشرفت" },
  ]);

  console.log("Seeding completed!");
}

seed().catch(console.error);
