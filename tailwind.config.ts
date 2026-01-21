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
          dark: '#0A0A0A',
          card: '#121212',
          elevated: '#1A1A1A',
          secondary: '#111111',
          tertiary: '#1A1A1A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#E5E5E5',
          muted: '#A3A3A3',
          accent: '#A78BFA',
          tertiary: '#9CA3AF',
        },
        border: {
          default: '#333333',
          accent: '#6D28D9',
          muted: '#262626',
          separator: '#2A2A2A',
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
        'gradient-purple': 'linear-gradient(to bottom right, #4C1D95, #6D28D9)',
        'gradient-dark': 'linear-gradient(to bottom, #0A0A0A, #1A1A1A)',
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
        'purple-glow': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
