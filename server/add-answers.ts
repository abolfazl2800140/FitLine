import { db } from "./db";
import { questions, answers, users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function addAnswers() {
    console.log("Adding answers...");

    // Get existing questions
    const existingQuestions = await db.select().from(questions);
    console.log(`Found ${existingQuestions.length} questions`);

    if (existingQuestions.length === 0) {
        console.log("No questions found!");
        return;
    }

    // Get coaches
    const allUsers = await db.select().from(users);
    const coach1 = allUsers.find(u => u.username === "ali_coach");
    const coach2 = allUsers.find(u => u.username === "sara_fit");
    const regularUser = allUsers.find(u => u.username === "reza_fit");

    if (!coach1 || !coach2) {
        console.log("Coaches not found!");
        return;
    }

    // Delete existing answers first
    await db.delete(answers);
    console.log("Cleared existing answers");

    // Add answers
    const answersData = [];

    // Answers for first question
    if (existingQuestions[0]) {
        answersData.push(
            {
                questionId: existingQuestions[0].id,
                userId: coach1.id,
                content: "بهترین زمان مصرف پروتئین بلافاصله بعد از تمرین هست، چون عضلات در این زمان بیشترین نیاز رو به پروتئین دارن. این بازه زمانی رو \"پنجره آنابولیک\" میگن که حدود ۳۰ دقیقه تا ۲ ساعت بعد از تمرینه.",
                voteCount: 28,
                isBestAnswer: true,
            },
            {
                questionId: existingQuestions[0].id,
                userId: coach2.id,
                content: "علاوه بر بعد از تمرین، مصرف پروتئین قبل از خواب هم خیلی مفیده. پروتئین کازئین برای شب عالیه چون آهسته جذب میشه.",
                voteCount: 15,
                isBestAnswer: false,
            }
        );
    }

    // Answers for second question
    if (existingQuestions[1]) {
        answersData.push(
            {
                questionId: existingQuestions[1].id,
                userId: coach1.id,
                content: "برای محافظت از زانو:\n۱. حتماً گرم کردن قبل از تمرین\n۲. فرم صحیح اسکات (زانو از نوک پا جلوتر نره)\n۳. تقویت عضلات چهارسر و همسترینگ\n۴. استفاده از زانوبند در تمرینات سنگین",
                voteCount: 42,
                isBestAnswer: true,
            },
            {
                questionId: existingQuestions[1].id,
                userId: coach2.id,
                content: "اگه درد زانو ادامه داره، حتماً به یه فیزیوتراپ مراجعه کن. شاید مشکل از تکنیک نباشه و نیاز به درمان داشته باشی.",
                voteCount: 18,
                isBestAnswer: false,
            }
        );
    }

    // Answers for third question
    if (existingQuestions[2]) {
        answersData.push(
            {
                questionId: existingQuestions[2].id,
                userId: coach2.id,
                content: "رژیم کتو برای کاهش وزن سریع مؤثره ولی چند نکته مهم:\n- اوایل ممکنه سردرد و خستگی داشته باشی (کتو فلو)\n- برای ورزشکاران حرفه‌ای توصیه نمیشه\n- بلندمدت ممکنه مشکلاتی ایجاد کنه\n- حتماً با متخصص تغذیه مشورت کن",
                voteCount: 35,
                isBestAnswer: true,
            },
            {
                questionId: existingQuestions[2].id,
                userId: coach1.id,
                content: "به نظرم رژیم متعادل با کسری کالری بهتر از کتوئه. پایدارتره و عوارض کمتری داره.",
                voteCount: 22,
                isBestAnswer: false,
            }
        );
    }

    if (answersData.length > 0) {
        await db.insert(answers).values(answersData);
        console.log(`Added ${answersData.length} answers!`);
    }

    console.log("Done!");
}

addAnswers().catch(console.error);
