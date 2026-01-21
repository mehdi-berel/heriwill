// Design system for HeriWill SaaS app
// Based on sign-off and sign-off-web design patterns

export const colors = {
  // Primary colors (purple theme)
  primary: {
    900: '#4C1D95', // Deep purple
    800: '#5B21B6',
    700: '#6D28D9',
    600: '#7C3AED', // Main purple
    500: '#8B5CF6',
    400: '#A78BFA',
    300: '#C4B5FD',
    200: '#DDD6FE',
    100: '#EDE9FE',
    50: '#F5F3FF',
  },
  
  // Background colors (dark theme)
  background: {
    dark: '#0A0A0A', // Near black
    card: '#121212', // Slightly lighter black for cards
    elevated: '#1A1A1A', // For elevated components
    secondary: '#111111',
    tertiary: '#1A1A1A',
    gradient: {
      start: '#0A0A0A',
      end: '#4C1D95',
    }
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF', // White
    secondary: '#E5E5E5', // Light gray
    muted: '#A3A3A3', // More muted gray
    accent: '#A78BFA', // Light purple
    tertiary: '#9CA3AF',
  },
  
  // Border colors
  border: {
    default: '#333333',
    accent: '#6D28D9',
    muted: '#262626',
    separator: '#2A2A2A',
  },
  
  // Status colors
  status: {
    success: '#10B981', // Green
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    info: '#3B82F6', // Blue
  }
};

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
};

export const borderRadius = {
  sm: '0.25rem', // 4px
  md: '0.5rem',  // 8px
  lg: '1rem',    // 16px
  xl: '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: '0 0 15px rgba(124, 58, 237, 0.5)',
  purpleGlow: '0 0 20px rgba(139, 92, 246, 0.3)',
  'glow-sm': '0 0 15px 0 rgba(124, 58, 237, 0.3)',
  'glow-md': '0 0 25px 0 rgba(124, 58, 237, 0.4)',
  'glow-lg': '0 0 35px 0 rgba(124, 58, 237, 0.5)',
};

export const transitions = {
  fast: 'all 0.15s ease',
  medium: 'all 0.3s ease',
  slow: 'all 0.5s ease',
};

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// Common component styles
export const componentStyles = {
  card: {
    base: `bg-[${colors.background.card}] border border-[${colors.border.muted}] rounded-${borderRadius.lg} overflow-hidden transition-all duration-300`,
    hover: `hover:border-[${colors.border.accent}] hover:shadow-${shadows.purpleGlow}`,
  },
  button: {
    primary: `bg-[${colors.primary[600]}] text-white font-semibold px-${spacing.lg} py-${spacing.md} rounded-${borderRadius.md} hover:bg-[${colors.primary[700]}] transition-all duration-300 shadow-${shadows['glow-sm']} hover:shadow-${shadows['glow-md']}`,
    secondary: `bg-transparent border border-[${colors.primary[600]}] text-[${colors.primary[400]}] font-semibold px-${spacing.lg} py-${spacing.md} rounded-${borderRadius.md} hover:bg-[${colors.primary[900]}] hover:text-[${colors.primary[300]}] transition-all duration-300`,
    text: `text-[${colors.text.accent}] font-medium hover:text-[${colors.primary[400]}] transition-all duration-300`,
    gradient: `bg-gradient-purple text-white font-semibold px-${spacing.lg} py-${spacing.md} rounded-${borderRadius.md} hover:shadow-${shadows['glow-md']} border-0 transition-all duration-300`,
  },
  section: {
    padding: `py-${spacing['3xl']} px-${spacing.lg}`,
  },
};

// Animation classes
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  slideLeft: 'animate-slide-left',
  slideRight: 'animate-slide-right',
  pulsePurple: 'animate-pulse-purple',
  pulseSlow: 'animate-pulse-slow',
  float: 'animate-float',
};

// Utility classes
export const utilities = {
  textGradient: 'text-gradient',
  bgGradientPurple: 'bg-gradient-purple',
  bgGradientDark: 'bg-gradient-dark',
  cardHover: 'card-hover',
  sectionDivider: 'section-divider',
};

// Export default design system
const designSystem = {
  colors,
  spacing,
  borderRadius,
  shadows,
  transitions,
  typography,
  componentStyles,
  animations,
  utilities,
};

export default designSystem;
