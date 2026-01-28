import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        background: {
          DEFAULT: '#0a0a0a',
          dark: '#000000',
          card: '#121212',
          elevated: '#1A1A1A',
          secondary: '#141417',
          tertiary: '#1F1F23',
          hover: '#1F1F23',
          muted: '#27272A',
        },
        text: {
          DEFAULT: '#FFFFFF',
          primary: '#FFFFFF',
          secondary: '#E5E5E5',
          muted: '#A3A3A3',
          accent: '#A78BFA',
          tertiary: '#71717A',
        },
        border: {
          DEFAULT: '#27272A',
          light: '#3F3F46',
          accent: '#7E22CE',
          muted: '#18181B',
          separator: '#27272A',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-purple': 'linear-gradient(135deg, #7E22CE 0%, #A855F7 50%, #9333EA 100%)',
        'gradient-purple-soft': 'linear-gradient(135deg, #581C87 0%, #7E22CE 80%, #9333EA 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #09090B 50%, #0C0C0E 100%)',
        'gradient-dark-elevated': 'linear-gradient(180deg, #09090B 0%, #18181B 100%)',
        'gradient-mesh': 'radial-gradient(at 0% 0%, rgba(126, 34, 206, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.08) 0px, transparent 50%), linear-gradient(180deg, #09090B 0%, #0C0C0E 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'slide-down': 'slideDown 0.5s ease forwards',
        'slide-left': 'slideInLeft 0.5s ease forwards',
        'slide-right': 'slideInRight 0.5s ease forwards',
        'pulse-purple': 'pulse 2s infinite',
        'pulse-slow': 'pulseSlow 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'data-flow': 'dataFlow 3s linear infinite',
        'count-up': 'countUp 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(124, 58, 237, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(124, 58, 237, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(124, 58, 237, 0)' },
        },
        pulseSlow: {
          '0%': { opacity: '0.7' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.7' },
        },
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' },
        },
        dataFlow: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(300px)', opacity: '0' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px 0 rgba(124, 58, 237, 0.3)',
        'glow-md': '0 0 25px 0 rgba(124, 58, 237, 0.4)',
        'glow-lg': '0 0 35px 0 rgba(124, 58, 237, 0.5)',
        'glow': '0 0 40px rgba(139, 92, 246, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 25px -5px rgba(124, 58, 237, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
} satisfies Config
