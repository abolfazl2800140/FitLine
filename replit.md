# FitLine - Persian Fitness Social Platform & Coach Marketplace

## Overview

FitLine is a comprehensive fitness platform that combines a coach marketplace, social fitness network, training programs, messaging system, supplement store, gamified leagues, and educational resources. The platform is designed specifically for Persian-speaking users with full RTL (right-to-left) support and Persian language throughout the interface.

**Core Purpose**: Connect fitness enthusiasts with professional coaches while providing a complete ecosystem for training, progress tracking, social engagement, and fitness education.

**Target Users**: 
- Fitness enthusiasts seeking professional coaching and community support
- Professional fitness coaches offering services and programs
- Users interested in supplements, challenges, and gamified fitness progression

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with Vite bundler
- **UI Library**: ShadCN UI components built on Radix UI primitives
- **Styling**: TailwindCSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Language**: Full Persian (Farsi) UI with RTL layout support

**Design System**:
- Primary color scheme: Black matte (#0A0A0A) with neon orange (#FF6B35) accent
- Alternative themes available via CSS variables (Blue sporty, Lime green)
- Typography: IranYekan and Vazirmatn fonts for Persian text support
- Mobile-first responsive design with bottom navigation for mobile, top navigation for desktop
- Card-based layouts with consistent spacing system (Tailwind units: 4, 8, 12, 16, 24)

**Key Pages**:
- Home: Personalized dashboard with featured content
- Coaches: Marketplace with filtering and coach profiles
- Feed: Social posts with likes, comments, and follows
- Programs: Training program browser and user enrollments
- Store: Supplement marketplace with cart functionality
- Messages: Real-time coach-client messaging
- Leagues: Monthly gamified competition system
- Challenges: Weekly/monthly fitness challenges
- Education: Q&A hub for fitness questions
- Profile: User progress tracking with charts and badges

### Backend Architecture

**Framework**: Express.js (Node.js)
- **API Style**: RESTful endpoints
- **Session Management**: Express-session with passport.js for authentication
- **Authentication**: Local strategy (email/password) with JWT-based sessions
- **File Upload**: Multer for handling media uploads
- **Real-time**: WebSocket support via ws library for messaging

**Authentication Flow**:
- Passport Local Strategy for username/password authentication
- BCrypt for password hashing
- Session-based authentication with 7-day cookie expiration
- Role-based access control (user, coach, admin roles)

**API Structure**:
- `/api/auth/*` - Authentication endpoints (login, register, logout, current user)
- `/api/coaches/*` - Coach profiles and filtering
- `/api/programs/*` - Training programs and enrollments
- `/api/posts/*` - Social feed posts, likes, comments
- `/api/supplements/*` - Supplement store products
- `/api/cart/*` - Shopping cart management
- `/api/challenges/*` - Fitness challenges
- `/api/leagues/*` - Monthly league system
- `/api/messages/*` - Real-time messaging
- `/api/questions/*` - Educational Q&A system

**Storage Layer**:
- Abstracted storage interface in `server/storage.ts` for database operations
- CRUD operations for all major entities (users, coaches, programs, posts, etc.)
- Support for filtering, pagination, and relationships

### Data Architecture

**ORM**: Drizzle ORM
- Schema-first approach with TypeScript types
- PostgreSQL dialect with Neon serverless driver
- Migration system via drizzle-kit

**Database Schema** (Key Tables):
- `users` - User accounts with profile information, role-based access
- `coach_profiles` - Extended coach information (specialty, pricing, ratings)
- `programs` - Training programs with weeks/days structure
- `workout_days` - Individual workout sessions
- `exercises` - Exercise definitions with sets/reps
- `posts` - Social feed content
- `comments`, `likes`, `follows` - Social engagement
- `messages`, `conversations` - Real-time messaging
- `supplements` - Product catalog
- `cart_items`, `orders` - E-commerce
- `challenges`, `challenge_participants` - Challenge system
- `leagues`, `league_members` - Monthly competition
- `badges`, `user_badges` - Gamification
- `progress_photos`, `progress_metrics` - User tracking
- `reviews`, `supplement_reviews` - Rating systems
- `questions`, `answers` - Q&A platform

**Key Design Decisions**:
- UUID primary keys for all tables
- Enum types for constrained values (user roles, difficulty levels, league tiers)
- JSONB fields for flexible data (coach gallery, program structure)
- Timestamp tracking for created/updated dates
- Decimal types for precise numeric values (prices, measurements)

### Real-time Communication

**WebSocket Implementation**:
- WebSocket server attached to HTTP server
- Real-time messaging between coaches and clients
- Message delivery and read receipts
- Unread message counts

**Connection Management**:
- WebSocket connections mapped to user sessions
- Automatic reconnection handling
- Message queuing for offline users

## External Dependencies

### Database & Storage
- **Neon Database**: PostgreSQL serverless database (via `@neondatabase/serverless`)
- **Connection Pooling**: PostgreSQL connection pool for optimal performance
- **WebSocket Bridge**: WS library for PostgreSQL compatibility with Neon

### Authentication & Security
- **Passport.js**: Authentication middleware with Local strategy
- **BCrypt**: Password hashing (bcryptjs for cross-platform compatibility)
- **Express-session**: Session management
- **Connect-pg-simple**: PostgreSQL session store (configured but may use in-memory store in development)

### UI Component Libraries
- **Radix UI**: Accessible component primitives (20+ components including Dialog, Dropdown, Tabs, etc.)
- **Recharts**: Data visualization for progress charts
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Utility class merging

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Integration between RHF and Zod
- **drizzle-zod**: Database schema to Zod schema conversion

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **PostCSS & Autoprefixer**: CSS processing

### Build & Deployment
- **Build Script**: Custom build process bundling both client (Vite) and server (ESBuild)
- **Static Serving**: Express serves built frontend assets
- **Development Mode**: Vite middleware for HMR in development
- **Replit Integration**: Special plugins for Replit environment (@replit/vite-plugin-*)

### Future Integration Points
- **AI Microservice**: Placeholder for image analysis and recommendations (FastAPI)
- **Redis**: Configured for caching and real-time features (queue management)
- **S3-Compatible Storage**: Prepared for MinIO/Arvan cloud storage integration
- **Email Service**: Nodemailer dependency for transactional emails

### Font & Typography
- **IranYekan**: Primary Persian font (loaded via CDN)
- **Vazirmatn**: Fallback Persian font
- **Inter**: Latin character support