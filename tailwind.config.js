/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0A0A0A',
          900: '#111111',
          850: '#141414',
          800: '#1C1C1E',
          700: '#2C2C2E',
          600: '#3A3A3C',
        },
        offwhite: {
          50: '#FFFFFF',
          100: '#F5F5F7',
          200: '#E8E8ED',
          300: '#D2D2D7',
          400: '#86868B',
        },
        accent: {
          50: '#F0F6FF',
          100: '#E0EEFF',
          400: '#3894FF',
          500: '#0071E3',
          600: '#005BB5',
          700: '#00478F',
          dark: '#2997FF',
        },
      },
      boxShadow: {
        'apple-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'apple-card': '0 2px 12px -2px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'apple-card-hover': '0 14px 34px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'apple-modal': '0 24px 60px -12px rgba(0, 0, 0, 0.22), 0 8px 24px -4px rgba(0, 0, 0, 0.1)',
        'apple-dark-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'apple-dark-modal': '0 30px 70px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Plus Jakarta Sans"',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
