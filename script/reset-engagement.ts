import { db } from "../server/db";
import { posts, comments, likes, questions, answers, questionVotes, answerVotes } from "../shared/schema";

async function resetEngagement() {
  console.log("🔄 شروع ریست کردن لایک‌ها و کامنت‌ها...\n");

  // Delete all likes
  const deletedLikes = await db.delete(likes).returning();
  console.log(`✅ ${deletedLikes.length} لایک حذف شد`);

  // Delete all comments
  const deletedComments = await db.delete(comments).returning();
  console.log(`✅ ${deletedComments.length} کامنت حذف شد`);

  // Reset post counters
  await db.update(posts).set({ likeCount: 0, commentCount: 0 });
  console.log("✅ شمارنده‌های پست‌ها صفر شد");

  // Delete all question votes
  const deletedQVotes = await db.delete(questionVotes).returning();
  console.log(`✅ ${deletedQVotes.length} رای سوال حذف شد`);

  // Delete all answer votes
  const deletedAVotes = await db.delete(answerVotes).returning();
  console.log(`✅ ${deletedAVotes.length} رای پاسخ حذف شد`);

  // Delete all answers
  const deletedAnswers = await db.delete(answers).returning();
  console.log(`✅ ${deletedAnswers.length} پاسخ حذف شد`);

  // Reset question counters
  await db.update(questions).set({ voteCount: 0, answerCount: 0 });
  console.log("✅ شمارنده‌های سوالات صفر شد");

  console.log("\n🎉 همه لایک‌ها و کامنت‌ها با موفقیت ریست شدند!");
  process.exit(0);
}

resetEngagement().catch((err) => {
  console.error("❌ خطا:", err);
  process.exit(1);
});
