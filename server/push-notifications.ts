import webpush from 'web-push';
import { db } from './db';
import { pushSubscriptions, meals, mealReminders, nutritionPlans } from '@shared/schema';
import { eq, and, lte, gte } from 'drizzle-orm';

// VAPID keys - در production باید از environment variables استفاده کنید
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls';

webpush.setVapidDetails(
    'mailto:support@fitline.ir',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export { VAPID_PUBLIC_KEY };

interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    actions?: { action: string; title: string }[];
}

// ارسال نوتیفیکیشن به یک کاربر
export async function sendPushNotification(userId: string, payload: NotificationPayload): Promise<boolean> {
    try {
        const subscriptions = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.userId, userId));

        if (subscriptions.length === 0) {
            console.log(`No push subscriptions found for user ${userId}`);
            return false;
        }

        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/favicon.png',
            badge: payload.badge || '/favicon.png',
            tag: payload.tag,
            data: payload.data,
            actions: payload.actions || [],
        });

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: {
                                p256dh: sub.p256dh,
                                auth: sub.auth,
                            },
                        },
                        notificationPayload
                    );
                    return true;
                } catch (error: any) {
                    // اگر subscription منقضی شده، حذفش کن
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
                        console.log(`Removed expired subscription ${sub.id}`);
                    }
                    throw error;
                }
            })
        );

        return results.some((r) => r.status === 'fulfilled');
    } catch (error) {
        console.error('Error sending push notification:', error);
        return false;
    }
}

// ارسال یادآور وعده غذایی
export async function sendMealReminder(userId: string, mealTitle: string, mealTime: string): Promise<boolean> {
    return sendPushNotification(userId, {
        title: '🍽️ وقت غذاست!',
        body: `${mealTitle} - ساعت ${mealTime}`,
        tag: 'meal-reminder',
        data: {
            type: 'meal_reminder',
            url: '/nutrition',
        },
        actions: [
            { action: 'view', title: 'مشاهده برنامه' },
            { action: 'done', title: 'خوردم ✓' },
        ],
    });
}

// بررسی و ارسال یادآورهای زمان‌بندی شده
export async function checkAndSendScheduledReminders(): Promise<void> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    try {
        // پیدا کردن یادآورهایی که باید ارسال شوند
        const reminders = await db
            .select({
                reminder: mealReminders,
                meal: meals,
                plan: nutritionPlans,
            })
            .from(mealReminders)
            .innerJoin(meals, eq(mealReminders.mealId, meals.id))
            .innerJoin(nutritionPlans, eq(meals.nutritionPlanId, nutritionPlans.id))
            .where(
                and(
                    eq(mealReminders.isEnabled, true),
                    eq(mealReminders.reminderTime, currentTime),
                    eq(nutritionPlans.isActive, true)
                )
            );

        for (const { reminder, meal, plan } of reminders) {
            // بررسی که امروز ارسال نشده باشد
            if (reminder.lastSentAt) {
                const lastSent = new Date(reminder.lastSentAt);
                if (
                    lastSent.getDate() === now.getDate() &&
                    lastSent.getMonth() === now.getMonth() &&
                    lastSent.getFullYear() === now.getFullYear()
                ) {
                    continue; // امروز قبلاً ارسال شده
                }
            }

            // ارسال نوتیفیکیشن
            const sent = await sendMealReminder(reminder.userId, meal.title, meal.scheduledTime);

            if (sent) {
                // آپدیت زمان آخرین ارسال
                await db
                    .update(mealReminders)
                    .set({ lastSentAt: now })
                    .where(eq(mealReminders.id, reminder.id));
            }
        }
    } catch (error) {
        console.error('Error checking scheduled reminders:', error);
    }
}

// شروع scheduler برای چک کردن یادآورها هر دقیقه
let reminderInterval: NodeJS.Timeout | null = null;

export function startReminderScheduler(): void {
    if (reminderInterval) {
        clearInterval(reminderInterval);
    }

    // هر دقیقه چک کن
    reminderInterval = setInterval(checkAndSendScheduledReminders, 60 * 1000);

    // یک بار هم الان چک کن
    checkAndSendScheduledReminders();

    console.log('Meal reminder scheduler started');
}

export function stopReminderScheduler(): void {
    if (reminderInterval) {
        clearInterval(reminderInterval);
        reminderInterval = null;
        console.log('Meal reminder scheduler stopped');
    }
}
