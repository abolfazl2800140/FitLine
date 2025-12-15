import { db } from "../server/db";
import { supplements } from "../shared/schema";
import { eq } from "drizzle-orm";

const supplementsData = [
  {
    name: "وی پروتئین گلد استاندارد",
    nutritionFacts: {
      "کالری": "120 کیلوکالری",
      "پروتئین": "24 گرم",
      "کربوهیدرات": "3 گرم",
      "چربی": "1 گرم",
      "BCAA": "5.5 گرم",
      "گلوتامین": "4 گرم"
    }
  },
  {
    name: "بی‌سی‌ای‌ای ۲:۱:۱",
    nutritionFacts: {
      "کالری": "0 کیلوکالری",
      "لوسین": "5 گرم",
      "ایزولوسین": "2.5 گرم",
      "والین": "2.5 گرم",
      "قند": "0 گرم"
    }
  },
  {
    name: "کراتین مونوهیدرات",
    nutritionFacts: {
      "کراتین مونوهیدرات": "5 گرم",
      "کالری": "0 کیلوکالری",
      "کربوهیدرات": "0 گرم",
      "خلوص": "99.9%"
    }
  },
  {
    name: "پری‌ورک‌اوت C4",
    nutritionFacts: {
      "کافئین": "150 میلی‌گرم",
      "بتا آلانین": "1.6 گرم",
      "کراتین نیترات": "1 گرم",
      "آرژنین": "1 گرم",
      "ویتامین B12": "35 میکروگرم"
    }
  },
  {
    name: "مولتی ویتامین ورزشی",
    nutritionFacts: {
      "ویتامین A": "3000 IU",
      "ویتامین C": "300 میلی‌گرم",
      "ویتامین D": "1500 IU",
      "ویتامین E": "100 IU",
      "روی": "15 میلی‌گرم",
      "منیزیم": "100 میلی‌گرم"
    }
  }
];

async function updateSupplements() {
  console.log("🔄 در حال آپدیت ارزش غذایی مکمل‌ها...");

  for (const supp of supplementsData) {
    const result = await db.update(supplements)
      .set({
        nutritionFacts: supp.nutritionFacts
      })
      .where(eq(supplements.name, supp.name))
      .returning();
    
    if (result.length > 0) {
      console.log(`✅ ${supp.name} آپدیت شد`);
    } else {
      console.log(`❌ ${supp.name} پیدا نشد`);
    }
  }

  console.log("🎉 تمام!");
  process.exit(0);
}

updateSupplements().catch(console.error);
