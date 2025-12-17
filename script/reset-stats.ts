import { db } from "../server/db";
import { exerciseTutorials, articles } from "@shared/schema";

async function resetStats() {
  console.log("Resetting likeCount and viewCount for tutorials and articles...");

  // Reset tutorials
  await db.update(exerciseTutorials).set({
    likeCount: 0,
    viewCount: 0,
  });
  console.log("✓ Tutorials reset");

  // Reset articles
  await db.update(articles).set({
    likeCount: 0,
    viewCount: 0,
  });
  console.log("✓ Articles reset");

  console.log("Done!");
  process.exit(0);
}

resetStats().catch(console.error);
