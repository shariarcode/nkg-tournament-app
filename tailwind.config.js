/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-1': '#08090A', // Main background
        'dark-2': '#121415', // Card background
        'dark-3': '#1A1C1E', // Slightly lighter card bg / inputs
        'brand-green': '#96F01D',
        'brand-yellow': '#E5A83D',
        'light-1': '#F5F5F5',
        'light-2': '#A0A0A0',

        'light-bg': '#FFFFFF',
        'light-surface': '#F5F5F5',
        'light-element': '#E5E7EB',
        'dark-text': '#121415',
        'dark-text-secondary': '#6B7280',
      },
      fontFamily: {
        display: ['"Russo One"', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'green-glow': '0 0 15px rgba(150, 240, 29, 0.4)',
        'yellow-glow': '0 0 15px rgba(229, 168, 61, 0.4)',
      },
      keyframes: {
        'fade-in-up': {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}