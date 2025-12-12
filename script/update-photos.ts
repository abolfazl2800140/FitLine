import { db } from "../server/db";
import { progressPhotos } from "../shared/schema";

async function updatePhotos() {
    console.log("🖼️ Updating progress photos to placeholder...");

    // Update all progress photos to use a placeholder
    await db.update(progressPhotos).set({
        imageUrl: "/placeholder-progress.svg",
    });

    console.log("✅ Done!");
    process.exit(0);
}

updatePhotos().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
