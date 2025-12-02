/**
 * Elite Fitness Hub - Design System Tokens
 * =========================================
 * این فایل شامل تمام توکن‌های طراحی سیستم است.
 * از این مقادیر در کل اپلیکیشن استفاده کنید.
 */

// ============================================
// 🎨 COLOR PALETTE
// ============================================

export const colors = {
  // Primary - Sport Green
  primary: {
    DEFAULT: "hsl(145, 70%, 42%)",
    light: "hsl(145, 70%, 55%)",
    dark: "hsl(145, 70%, 32%)",
    muted: "hsl(145, 30%, 90%)",
    foreground: "hsl(0, 0%, 100%)",
  },

  // Secondary - Sport Blue
  secondary: {
    DEFAULT: "hsl(200, 85%, 50%)",
    light: "hsl(200, 85%, 65%)",
    dark: "hsl(200, 85%, 40%)",
    muted: "hsl(200, 40%, 92%)",
    foreground: "hsl(0, 0%, 100%)",
  },

  // Semantic Colors
  semantic: {
    success: "hsl(145, 70%, 42%)",    // سبز - موفقیت
    warning: "hsl(38, 92%, 50%)",      // نارنجی - هشدار
    error: "hsl(0, 84%, 60%)",         // قرمز - خطا
    info: "hsl(200, 85%, 50%)",        // آبی - اطلاعات
  },

  // Accent Colors (برای آیکون‌ها و تزئینات)
  accent: {
    flame: "hsl(25, 95%, 53%)",        // 🔥 نارنجی آتش - کالری
    trophy: "hsl(45, 93%, 47%)",       // 🏆 طلایی - رتبه/جایزه
    energy: "hsl(145, 70%, 42%)",      // ⚡ سبز - انرژی/پیشرفت
    heart: "hsl(350, 80%, 55%)",       // ❤️ قرمز - لایک/علاقه
  },

  // Neutral Colors
  neutral: {
    white: "hsl(0, 0%, 100%)",
    background: "hsl(0, 0%, 100%)",
    card: "hsl(0, 0%, 100%)",
    border: "hsl(0, 0%, 90%)",
    muted: "hsl(0, 0%, 96%)",
    mutedForeground: "hsl(0, 0%, 45%)",
    foreground: "hsl(0, 0%, 10%)",
  },
} as const;

// ============================================
// 📐 SPACING
// ============================================

export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",   // 2px
  1: "0.25rem",      // 4px
  1.5: "0.375rem",   // 6px
  2: "0.5rem",       // 8px
  2.5: "0.625rem",   // 10px
  3: "0.75rem",      // 12px
  3.5: "0.875rem",   // 14px
  4: "1rem",         // 16px
  5: "1.25rem",      // 20px
  6: "1.5rem",       // 24px
  7: "1.75rem",      // 28px
  8: "2rem",         // 32px
  9: "2.25rem",      // 36px
  10: "2.5rem",      // 40px
  12: "3rem",        // 48px
  14: "3.5rem",      // 56px
  16: "4rem",        // 64px
  20: "5rem",        // 80px
} as const;

// ============================================
// 🔤 TYPOGRAPHY
// ============================================

export const typography = {
  // Font Families
  fontFamily: {
    persian: "'Vazirmatn', 'IranYekan', system-ui, sans-serif",
    english: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', Menlo, monospace",
  },

  // Font Sizes
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],        // 12px
    sm: ["0.875rem", { lineHeight: "1.25rem" }],    // 14px
    base: ["1rem", { lineHeight: "1.5rem" }],       // 16px
    lg: ["1.125rem", { lineHeight: "1.75rem" }],    // 18px
    xl: ["1.25rem", { lineHeight: "1.75rem" }],     // 20px
    "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24px
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
  },

  // Font Weights
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
} as const;

// ============================================
// 📦 BORDER RADIUS
// ============================================

export const borderRadius = {
  none: "0",
  sm: "0.1875rem",    // 3px
  DEFAULT: "0.375rem", // 6px
  md: "0.5rem",       // 8px
  lg: "0.75rem",      // 12px
  xl: "1rem",         // 16px
  "2xl": "1.5rem",    // 24px - کارت‌های اصلی
  "3xl": "2rem",      // 32px
  full: "9999px",     // دکمه‌های pill
} as const;

// ============================================
// 🌫️ SHADOWS
// ============================================

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  
  // Glow Effects
  glowGreen: "0 0 25px -5px hsl(145 70% 42% / 0.5)",
  glowBlue: "0 0 25px -5px hsl(200 85% 50% / 0.5)",
} as const;

// ============================================
// ⏱️ TRANSITIONS
// ============================================

export const transitions = {
  // Durations
  duration: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  // Easings
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

// ============================================
// 📱 BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================
// 🧩 COMPONENT TOKENS
// ============================================

export const components = {
  // Button
  button: {
    height: {
      sm: "2rem",      // 32px
      md: "2.5rem",    // 40px
      lg: "3rem",      // 48px
      xl: "3.5rem",    // 56px
    },
    padding: {
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
    },
    borderRadius: borderRadius["full"], // pill shape
  },

  // Card
  card: {
    borderRadius: borderRadius["2xl"],
    padding: {
      sm: "0.75rem",   // 12px
      md: "1rem",      // 16px
      lg: "1.25rem",   // 20px
    },
    border: `1px solid ${colors.neutral.border}`,
  },

  // Avatar
  avatar: {
    size: {
      xs: "1.5rem",    // 24px
      sm: "2rem",      // 32px
      md: "2.5rem",    // 40px
      lg: "4rem",      // 64px
      xl: "6rem",      // 96px
    },
  },

  // Badge
  badge: {
    height: "1.5rem",
    padding: "0.5rem 0.75rem",
    borderRadius: borderRadius["full"],
    fontSize: typography.fontSize.xs[0],
  },

  // Input
  input: {
    height: "2.75rem",  // 44px
    borderRadius: borderRadius["xl"],
    padding: "0 1rem",
  },

  // Bottom Navigation
  bottomNav: {
    height: "4.5rem",   // 72px
    iconSize: "1.5rem", // 24px
  },
} as const;

// ============================================
// 🎯 ICON SIZES
// ============================================

export const iconSizes = {
  xs: "0.75rem",   // 12px
  sm: "1rem",      // 16px
  md: "1.25rem",   // 20px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "2.5rem", // 40px
} as const;

// ============================================
// 📋 Z-INDEX
// ============================================

export const zIndex = {
  dropdown: 50,
  sticky: 100,
  fixed: 200,
  modalBackdrop: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
} as const;
