import { db } from "../server/db";
import { users, coachProfiles } from "../shared/schema";
import { eq } from "drizzle-orm";

async function listUsers() {
  console.log("\n========== لیست مربیان ==========\n");
  
  const coaches = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      email: users.email,
      phone: users.phone,
      role: users.role,
      specialty: coachProfiles.specialty,
      experience: coachProfiles.experience,
    })
    .from(users)
    .leftJoin(coachProfiles, eq(users.id, coachProfiles.userId))
    .where(eq(users.role, 'coach'));

  console.log(`تعداد مربیان: ${coaches.length}\n`);
  coaches.forEach((coach, i) => {
    console.log(`${i + 1}. ${coach.fullName} (@${coach.username})`);
    console.log(`   تخصص: ${coach.specialty || '-'} | سابقه: ${coach.experience || 0} سال`);
    console.log(`   ایمیل: ${coach.email || '-'} | تلفن: ${coach.phone || '-'}`);
    console.log('');
  });

  console.log("\n========== لیست شاگردان (کاربران عادی) ==========\n");
  
  const students = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      username: users.username,
      email: users.email,
      phone: users.phone,
      role: users.role,
      points: users.points,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, 'user'));

  console.log(`تعداد شاگردان: ${students.length}\n`);
  students.forEach((student, i) => {
    console.log(`${i + 1}. ${student.fullName} (@${student.username})`);
    console.log(`   ایمیل: ${student.email || '-'} | تلفن: ${student.phone || '-'}`);
    console.log(`   امتیاز: ${student.points}`);
    console.log('');
  });

  process.exit(0);
}

listUsers().catch(console.error);
