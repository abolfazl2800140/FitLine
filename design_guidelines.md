# FitLine Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from fitness and social platforms (Strava's activity feeds, MyFitnessPal's tracking interfaces, Instagram's social engagement) combined with marketplace aesthetics (Airbnb's filtering, Upwork's coach profiles). This hybrid approach balances sporty energy with minimal, clean professionalism.

## Visual Identity

### Typography
- **Primary Font**: IranYekan (Persian-optimized) for all UI text
- **Hierarchy**: 
  - Headlines: Bold, 32-40px for hero sections
  - Subheadings: SemiBold, 20-24px for section titles
  - Body: Regular, 16px for content
  - Captions: Regular, 14px for metadata
- **Line Height**: 1.6 for readability in RTL layout

### Color System
**Primary Palette: Black Matte + Orange Neon**
- Background: Matte black (#0A0A0A)
- Surface: Dark gray (#1A1A1A)
- Primary Accent: Neon orange (#FF6B35)
- Text: White (#FFFFFF) / Light gray (#E5E5E5)
- Success: Bright green for completed workouts
- Error: Bright red for validation

**Alternative Themes** (CSS variable swaps):
- Blue Sporty: Electric blue (#0096FF) accent
- Lime Green: Vibrant lime (#32FF7E) accent

### Spacing System
Use Tailwind units: **4, 8, 12, 16, 24** for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-24
- Card gaps: gap-4 to gap-6

## Layout Architecture

### RTL Configuration
- All layouts mirror right-to-left
- Navigation anchored to right side
- Form labels align right
- Progress bars fill from right to left
- Chat bubbles: user messages on left, coach on right

### Navigation Structure
**Mobile (Bottom Nav Bar)**
5 primary tabs with icons + Persian labels:
- خانه (Home)
- مربیان (Coaches) 
- فید (Feed)
- برنامه‌ها (Programs)
- پروفایل (Profile)

**Desktop (Top Right Navigation)**
Horizontal menu with logo left, search center, user menu right

### Grid System
- Mobile: Single column, full-width cards
- Tablet: 2-column grid for coaches/products
- Desktop: 3-4 column grid with max-width container (1280px)

## Core Components

### Cards
**Coach Card**: Rounded-xl, dark surface, vertical layout
- Profile image (circular, 80px)
- Name + specialty badge
- Rating stars + review count
- Price per session
- Quick stats (experience, clients)
- CTA button with orange accent

**Feed Post Card**: Rounded-lg, minimal padding
- User avatar + name + timestamp (right-aligned)
- Post content with image (if present)
- Engagement bar: like, comment, share icons
- Comment preview section

**Program Card**: Athletic aesthetic
- Program cover image (16:9)
- Duration badge overlay
- Title + coach name
- Progress ring (if enrolled)
- Difficulty level indicator

**Product Card** (Supplements): Clean e-commerce style
- Product image with zoom on hover
- Product name + brand
- Price (bold, orange)
- Rating + review count
- Add to cart button

### Forms & Inputs
- Rounded-lg borders with subtle focus glow
- Right-aligned labels above inputs
- Persian placeholder text
- Orange accent for active state
- Error messages in Persian below fields

### Progress Visualization
- **Progress Rings**: Recharts circular progress for workout completion
- **Timeline**: Vertical timeline with monthly photo milestones
- **Charts**: Line/bar charts for weight, strength tracking using Recharts
- **Badges**: Hexagonal or shield shapes for achievements

### Messaging Interface
- Split layout: conversation list (right) + active chat (left)
- Bubble design with timestamps
- Unread count badges (orange circular)
- Typing indicators
- File attachment preview cards

## Page Layouts

### Home (Personalized Feed)
Hero section: User progress snapshot with motivational metric
- Quick stats dashboard (3-4 metric cards)
- Infinite scroll feed with mixed content (posts, coach recommendations, challenges)
- Floating action button for new post (bottom right in RTL)

### Coaches Marketplace
- Top filter bar: price range, gender, specialty dropdowns (right-aligned)
- Grid of coach cards (responsive columns)
- Pagination or infinite scroll
- Featured coaches section at top

### Coach Profile
- Hero: Cover image with profile overlay (right side)
- Stats row: clients, experience, rating
- Navigation tabs: درباره (About), برنامه‌ها (Programs), نظرات (Reviews), گالری (Gallery)
- Before/after gallery in masonry grid
- CTA sticky bar at bottom: "رزرو جلسه" (Book Session)

### User Profile + Progress Timeline
- Profile header with avatar, bio, stats
- Tabbed content: Timeline, Programs, Achievements
- Monthly photo grid with weight/date overlays
- Interactive charts section below timeline
- Badge showcase wall

### League Rankings Page
- Leaderboard table with rank, avatar, name, score
- User's position highlighted with orange glow
- Top 3 podium visualization
- Division selector (Bronze, Silver, Gold, Platinum)
- Monthly countdown timer

### Supplement Store
- Category filters (horizontal scrollable chips)
- Product grid with hover effects
- Sticky cart icon with item count
- Product detail: large image carousel, description, nutrition facts table, reviews section

### Education Hub (Q&A)
- Search bar at top
- Category tags (clickable filters)
- Question cards with vote count, answer count
- Threaded answer layout with best answer highlighted

## Images
**Use Images For:**
- Coach profiles: Professional headshots and before/after transformations
- Feed posts: Workout progress photos, meal photos
- Program covers: High-energy workout imagery
- Supplement products: Clean product photography on white/black background
- Hero sections: Motivational fitness imagery with athletes in action
- User timeline: Monthly progress photos

**Hero Image Strategy**: 
- Home page: Full-width hero with motivational fitness scene, text overlay right-aligned
- Coach profiles: Cover photo showing coaching style/environment
- Product pages: Large product hero with detailed views below

## Interactive Elements
- **Buttons**: Orange primary, ghost secondary, minimal animations (scale on press)
- **Hover States**: Subtle lift (translateY) on cards
- **Loading**: Skeleton screens matching card layouts
- **Pull-to-Refresh**: Custom branded animation for feed
- **Swipe Gestures**: Swipe cards for quick actions (archive message, like post)

## Accessibility
- High contrast ratios (orange on black: 4.5:1+)
- Touch targets minimum 44x44px
- Focus indicators visible on keyboard navigation
- Screen reader support for Persian content
- Haptic feedback on mobile interactions

## PWA Features
- Offline indicator banner
- Install prompt with custom branded modal
- Splash screen with logo on dark background
- App icon: Bold "F" monogram with orange gradient