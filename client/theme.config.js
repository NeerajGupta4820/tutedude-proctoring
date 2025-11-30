// Theme & Design System Configuration
// This file documents the color scheme, typography, and spacing used throughout Interview Pro

export const THEME = {
  // Color Palette
  colors: {
    // Primary Colors - Cyan (Interview Pro Brand)
    primary: {
      50: '#ecf7fb',
      100: '#cde9f6',
      200: '#a5d8f0',
      300: '#7bc6e8',
      400: '#5ab6e3',
      500: '#06b6d4', // Main brand color
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },

    // Secondary Colors - Blue
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },

    // Semantic Colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Neutral Colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },

    // Status Colors
    status: {
      online: '#10b981',
      offline: '#6b7280',
      away: '#f59e0b',
      error: '#ef4444',
    },
  },

  // Typography
  typography: {
    // Font Family
    fontFamily: {
      primary:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen"',
      code: '"Fira Code", "Courier New", monospace',
    },

    // Font Sizes
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
    },

    // Font Weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // Spacing Scale
  spacing: {
    // Small spacing
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px

    // Section spacing
    section: '3rem', // 48px
    'section-lg': '4rem', // 64px
  },

  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '0.25rem', // 4px
    base: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem', // 32px
    full: '9999px',
  },

  // Shadows
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-out',
    base: '300ms ease-out',
    slow: '500ms ease-out',
    'extra-slow': '1000ms ease-out',
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Component Styles
export const COMPONENTS = {
  // Button Styles
  button: {
    // Primary button
    primary: `
      px-4 py-2 rounded-lg font-semibold
      bg-gradient-to-r from-cyan-600 to-cyan-700
      hover:from-cyan-700 hover:to-cyan-800
      text-white transition-all shadow-lg
      hover:shadow-cyan-600/50
      disabled:opacity-50 disabled:cursor-not-allowed
    `,

    // Secondary button
    secondary: `
      px-4 py-2 rounded-lg font-semibold
      bg-gray-100 hover:bg-gray-200
      text-gray-900 transition-all
      disabled:opacity-50 disabled:cursor-not-allowed
    `,

    // Danger button
    danger: `
      px-4 py-2 rounded-lg font-semibold
      bg-red-600 hover:bg-red-700
      text-white transition-all
      disabled:opacity-50 disabled:cursor-not-allowed
    `,

    // Success button
    success: `
      px-4 py-2 rounded-lg font-semibold
      bg-green-600 hover:bg-green-700
      text-white transition-all
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  },

  // Input Styles
  input: `
    w-full px-4 py-3
    bg-white/10 border border-white/20 rounded-lg
    text-white placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
    transition-all
  `,

  // Card Styles
  card: `
    bg-white rounded-xl shadow-lg p-6
    border border-gray-200
    hover:shadow-xl transition-shadow
  `,

  // Dialog Overlay
  overlay: `
    fixed inset-0 z-40 bg-black/50
    data-[state=open]:animate-in data-[state=closed]:animate-out
    data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
  `,
};

// Gradient Presets
export const GRADIENTS = {
  // Primary gradient
  primary: 'from-cyan-600 to-cyan-700',
  primaryHover: 'from-cyan-700 to-cyan-800',
  primaryLight: 'from-cyan-500 to-cyan-600',

  // Secondary gradient
  secondary: 'from-blue-600 to-blue-700',
  secondaryHover: 'from-blue-700 to-blue-800',

  // Success gradient
  success: 'from-green-600 to-green-700',
  successHover: 'from-green-700 to-green-800',

  // Error gradient
  error: 'from-red-600 to-red-700',
  errorHover: 'from-red-700 to-red-800',

  // Warning gradient
  warning: 'from-amber-600 to-amber-700',
  warningHover: 'from-amber-700 to-amber-800',

  // Background gradients
  bgDark: 'from-slate-900 via-slate-800 to-slate-900',
  bgLight: 'from-slate-50 to-slate-100',
  bgCard: 'from-white to-gray-50',
};

// Animation Presets
export const ANIMATIONS = {
  fadeIn: 'duration-300 ease-out',
  slideUp: 'duration-300 ease-out',
  slideDown: 'duration-300 ease-out',
  slideLeft: 'duration-300 ease-out',
  slideRight: 'duration-300 ease-out',
  bounce: 'duration-500 ease-in-out',
  pulse: 'duration-2000 ease-in-out',
};

// Z-Index Scale
export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 100,
};

// Icon Sizes
export const ICON_SIZES = {
  xs: '0.75rem', // 12px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '2.5rem', // 40px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

// Responsive Classes
export const RESPONSIVE = {
  container: 'w-full max-w-6xl mx-auto',
  containerLg: 'w-full max-w-7xl mx-auto',
  containerMd: 'w-full max-w-4xl mx-auto',
  containerSm: 'w-full max-w-2xl mx-auto',

  padding: 'px-4 sm:px-6 lg:px-8',
  paddingY: 'py-4 sm:py-6 lg:py-8',

  grid2: 'grid-cols-1 md:grid-cols-2',
  grid3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  grid4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export default THEME;
