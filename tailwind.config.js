/** @type {import('tailwindcss').Config} */
// Design tokens mirror the web front (front-minuseek `src/assets/css/index.css`).
// oklch values are converted to hex so they resolve correctly in React Native.
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#EEEEEE',
        foreground: '#1c1b18',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1c1b18',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1c1b18',
        },
        primary: {
          DEFAULT: '#091029',
          foreground: '#f2f2fb',
        },
        secondary: {
          DEFAULT: '#f4f4f5',
          foreground: '#27272a',
        },
        muted: {
          DEFAULT: '#f3f3f0',
          foreground: '#8c897c',
        },
        accent: {
          DEFAULT: '#f3f3f0',
          foreground: '#36352f',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        border: '#e7e6e1',
        input: '#e7e6e1',
        ring: '#b3b0a6',
        // Status palette mirrors front-minuseek `index.css` (used by CaseStatusBadge).
        grey: {
          'light-1': '#EEEEEE',
          'medium-1': '#A8A8A8',
          dark: '#383838',
        },
        orange: {
          light: '#FFECD8',
          medium: '#D85703',
        },
        blue: {
          'light-1': '#E0E0E8',
          'dark-1': '#091029',
        },
        green: {
          light: '#EAFEF3',
          medium: '#128755',
        },
      },
      borderRadius: {
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
    },
  },
  plugins: [],
};
