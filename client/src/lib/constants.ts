// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        ME: "/api/auth/me",
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
        LOGOUT: "/api/auth/logout",
    },
    POSTS: "/api/posts",
    USERS: "/api/users",
    COACHES: "/api/coaches",
    PROGRAMS: "/api/programs",
    MESSAGES: "/api/messages",
    CONVERSATIONS: "/api/conversations",
    SUPPLEMENTS: "/api/supplements",
    CHALLENGES: "/api/challenges",
    QUESTIONS: "/api/questions",
} as const;

// Query keys
export const QUERY_KEYS = {
    AUTH: [API_ENDPOINTS.AUTH.ME],
    POSTS: [API_ENDPOINTS.POSTS],
    COACHES: [API_ENDPOINTS.COACHES],
    PROGRAMS: [API_ENDPOINTS.PROGRAMS],
    CONVERSATIONS: [API_ENDPOINTS.CONVERSATIONS],
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

// File upload
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ALLOWED_AUDIO_TYPES: ["audio/webm", "audio/mp3", "audio/wav"],
} as const;

// Cache times (in milliseconds)
export const CACHE_TIMES = {
    SHORT: 1000 * 60, // 1 minute
    MEDIUM: 1000 * 60 * 5, // 5 minutes
    LONG: 1000 * 60 * 30, // 30 minutes
    VERY_LONG: 1000 * 60 * 60, // 1 hour
} as const;

// Animation durations
export const ANIMATION = {
    FAST: 0.15,
    NORMAL: 0.3,
    SLOW: 0.5,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    "2XL": 1536,
} as const;

// Routes
export const ROUTES = {
    HOME: "/",
    AUTH: "/auth",
    LOGIN: "/login",
    REGISTER: "/register",
    FEED: "/feed",
    PROFILE: "/profile",
    SETTINGS: "/settings",
    COACHES: "/coaches",
    PROGRAMS: "/programs",
    MESSAGES: "/messages",
    STORE: "/store",
    CHALLENGES: "/challenges",
    EDUCATION: "/education",
    LEADERBOARD: "/leaderboard",
    LEARN: "/learn",
} as const;
