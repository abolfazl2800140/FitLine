import { db } from "./db";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// Point values for different actions
export const POINT_VALUES = {
    // User/Athlete actions
    ASK_QUESTION: 2,
    ANSWER_QUESTION: 5,
    BEST_ANSWER_USER: 10,
    COMPLETE_WORKOUT: 3,
    JOIN_CHALLENGE: 5,
    WIN_CHALLENGE: 20,
    FIRST_LOGIN_DAILY: 1,

    // Coach actions
    COACH_ANSWER_QUESTION: 5,
    COACH_BEST_ANSWER: 15,
    CREATE_PROGRAM: 10,
    GET_NEW_STUDENT: 20,
    RECEIVE_POSITIVE_REVIEW: 5,
    COMPLETE_STUDENT_PROGRAM: 10,
};

export type PointAction = keyof typeof POINT_VALUES;

/**
 * Award points to a user
 */
export async function awardPoints(
    userId: string,
    action: PointAction,
    customPoints?: number
): Promise<{ success: boolean; points: number; newTotal: number }> {
    const pointsToAdd = customPoints ?? POINT_VALUES[action];

    const [updatedUser] = await db
        .update(users)
        .set({ points: sql`${users.points} + ${pointsToAdd}` })
        .where(eq(users.id, userId))
        .returning({ points: users.points });

    return {
        success: true,
        points: pointsToAdd,
        newTotal: updatedUser?.points ?? 0,
    };
}

/**
 * Get user's current points
 */
export async function getUserPoints(userId: string): Promise<number> {
    const [user] = await db
        .select({ points: users.points })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return user?.points ?? 0;
}

/**
 * Get leaderboard (top users by points)
 */
export async function getLeaderboard(limit: number = 10): Promise<Array<{
    id: string;
    fullName: string;
    avatar: string | null;
    points: number;
    role: string;
}>> {
    const topUsers = await db
        .select({
            id: users.id,
            fullName: users.fullName,
            avatar: users.avatar,
            points: users.points,
            role: users.role,
        })
        .from(users)
        .orderBy(sql`${users.points} DESC`)
        .limit(limit);

    return topUsers;
}
