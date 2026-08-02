/**
 * Enterprise Design Tokens for Personal Developer OS
 */

export const colors = {
  // Dark mode semantic palette
  dark: {
    bg: '#0d1117',
    surface: '#161b22',
    surfaceHover: '#21262d',
    border: '#30363d',
    borderMuted: '#21262d',
    primary: '#7ee787', // Terminal Green
    secondary: '#79c0ff', // Terminal Blue
    accent: '#f78166', // Terminal Red
    purple: '#d2a8ff', // Terminal Purple
    yellow: '#e3b341', // Terminal Yellow
    textPrimary: '#c9d1d9',
    textSecondary: '#8b949e',
    textMuted: '#6e7681',
  },
  // Light mode fallback tokens
  light: {
    bg: '#ffffff',
    surface: '#f6f8fa',
    surfaceHover: '#f3f4f6',
    border: '#d0d7de',
    borderMuted: '#eaeef2',
    primary: '#1a7f37',
    secondary: '#0969da',
    accent: '#cf222e',
    purple: '#8250df',
    yellow: '#9a6700',
    textPrimary: '#24292f',
    textSecondary: '#57606a',
    textMuted: '#8c959f',
  },
};

export const typography = {
  fontFamily: {
    mono: 'var(--font-mono), JetBrains Mono, monospace',
    sans: 'var(--font-sans), Inter, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
  20: '5rem',   // 80px
};

export const radius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  full: '9999px',
};

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dock: 10,
  dropdown: 200,
  sticky: 400,
  banner: 600,
  overlay: 800,
  modal: 1000,
  popover: 1200,
  toast: 1400,
  tooltip: 1600,
};

export const motionTokens = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};
