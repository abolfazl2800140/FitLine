import { apiRequest } from "@/lib/queryClient";
import type { Post, Comment, User, Conversation, Message } from "@/types";

// Auth API
export const authApi = {
    login: (phone: string, password: string) =>
        apiRequest("POST", "/api/auth/login", { phone, password }),

    register: (data: { phone: string; fullName: string; username: string; password: string; role: string }) =>
        apiRequest("POST", "/api/auth/register", data),

    logout: () => apiRequest("POST", "/api/auth/logout"),

    getMe: () => apiRequest("GET", "/api/auth/me"),
};

// Posts API
export const postsApi = {
    getAll: () => apiRequest("GET", "/api/posts"),

    getById: (id: string) => apiRequest("GET", `/api/posts/${id}`),

    create: (content: string, images?: string[]) =>
        apiRequest("POST", "/api/posts", { content, images }),

    delete: (id: string) => apiRequest("DELETE", `/api/posts/${id}`),

    like: (id: string) => apiRequest("POST", `/api/posts/${id}/like`),

    unlike: (id: string) => apiRequest("DELETE", `/api/posts/${id}/like`),

    getComments: (postId: string) => apiRequest("GET", `/api/posts/${postId}/comments`),

    addComment: (postId: string, content: string, parentId?: string) =>
        apiRequest("POST", `/api/posts/${postId}/comments`, { content, parentId }),
};

// Users API
export const usersApi = {
    getById: (id: string) => apiRequest("GET", `/api/users/${id}`),

    update: (data: Partial<User>) => apiRequest("PATCH", "/api/users/me", data),

    follow: (userId: string) => apiRequest("POST", `/api/users/${userId}/follow`),

    unfollow: (userId: string) => apiRequest("DELETE", `/api/users/${userId}/follow`),

    getFollowers: (userId: string) => apiRequest("GET", `/api/users/${userId}/followers`),

    getFollowing: (userId: string) => apiRequest("GET", `/api/users/${userId}/following`),
};

// Coaches API
export const coachesApi = {
    getAll: () => apiRequest("GET", "/api/coaches"),

    getById: (id: string) => apiRequest("GET", `/api/coaches/${id}`),

    createProfile: (data: { specialty: string; experience: number; pricePerSession: number }) =>
        apiRequest("POST", "/api/coach-profiles", data),

    updateProfile: (data: Partial<{ specialty: string; experience: number; pricePerSession: number }>) =>
        apiRequest("PATCH", "/api/coach-profiles", data),
};

// Programs API
export const programsApi = {
    getAll: () => apiRequest("GET", "/api/programs"),

    getById: (id: string) => apiRequest("GET", `/api/programs/${id}`),

    create: (data: { title: string; description?: string; durationWeeks: number; difficulty: string }) =>
        apiRequest("POST", "/api/programs", data),

    enroll: (programId: string) => apiRequest("POST", `/api/programs/${programId}/enroll`),
};

// Messages API
export const messagesApi = {
    getConversations: () => apiRequest("GET", "/api/conversations"),

    getMessages: (conversationId: string) =>
        apiRequest("GET", `/api/conversations/${conversationId}/messages`),

    sendMessage: (conversationId: string, content: string, messageType: string = "text") =>
        apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content, messageType }),

    markAsRead: (conversationId: string) =>
        apiRequest("POST", `/api/conversations/${conversationId}/read`),

    createConversation: (participantId: string) =>
        apiRequest("POST", "/api/conversations", { participantId }),
};

// Bookmarks API
export const bookmarksApi = {
    getAll: () => apiRequest("GET", "/api/bookmarks"),

    add: (itemId: string, itemType: string) =>
        apiRequest("POST", "/api/bookmarks", { itemId, itemType }),

    remove: (itemId: string) => apiRequest("DELETE", `/api/bookmarks/${itemId}`),
};

// Reports API
export const reportsApi = {
    create: (itemId: string, itemType: string, reason: string, description?: string) =>
        apiRequest("POST", "/api/reports", { itemId, itemType, reason, description }),
};
