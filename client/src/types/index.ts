// User types
export interface User {
    id: string;
    email?: string;
    phone?: string;
    username: string;
    fullName: string;
    avatar?: string | null;
    bio?: string | null;
    role: 'user' | 'coach' | 'admin';
    gender?: 'male' | 'female' | 'other';
    height?: string;
    weight?: string;
    bodyFat?: string;
    points: number;
    createdAt: string;
}

export interface CoachProfile {
    id: string;
    userId: string;
    specialty: string;
    experience: number;
    pricePerSession: string;
    credentials?: string | null;
    about?: string | null;
    clientCount: number;
    rating: string;
    reviewCount: number;
    coverImage?: string | null;
    isVerified: boolean;
    gallery: string[];
    user?: User;
}

// Post types
export interface Post {
    id: string;
    userId: string;
    content: string;
    images: string[];
    likeCount: number;
    commentCount: number;
    createdAt: string;
    isLiked?: boolean;
    isBookmarked?: boolean;
    user: {
        id: string;
        fullName: string;
        avatar: string | null;
    };
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    parentId: string | null;
    content: string;
    replyCount: number;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        avatar: string | null;
    };
}

// Message types
export interface Conversation {
    id: string;
    participant1Id: string;
    participant2Id: string;
    lastMessageAt: string;
    lastMessage?: string | null;
    otherUser?: User;
    unreadCount?: number;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    messageType: 'text' | 'voice' | 'image' | 'file';
    voiceUrl?: string | null;
    voiceDuration?: number | null;
    replyToId?: string | null;
    isRead: boolean;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
}

// Program types
export interface Program {
    id: string;
    coachId: string;
    title: string;
    description?: string | null;
    coverImage?: string | null;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    durationWeeks: number;
    price?: string | null;
    isPublic: boolean;
    createdAt: string;
    coach?: User;
}

// Supplement types
export interface Supplement {
    id: string;
    name: string;
    brand: string;
    description?: string | null;
    price: string;
    originalPrice?: string | null;
    image?: string | null;
    category: string;
    stock: number;
    rating: string;
    reviewCount: number;
}

// Challenge types
export interface Challenge {
    id: string;
    title: string;
    description?: string | null;
    type: 'weekly' | 'monthly';
    goal: string;
    targetValue?: number | null;
    startDate: string;
    endDate: string;
    participantCount: number;
    coverImage?: string | null;
}

// Question types
export interface Question {
    id: string;
    userId: string;
    title: string;
    content: string;
    category?: string | null;
    voteCount: number;
    answerCount: number;
    createdAt: string;
    user?: User;
}

export interface Answer {
    id: string;
    questionId: string;
    userId: string;
    content: string;
    isBestAnswer: boolean;
    voteCount: number;
    createdAt: string;
    user?: User;
}

// API Response types
export interface ApiError {
    message: string;
    status?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
