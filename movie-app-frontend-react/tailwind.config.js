/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0A0A0A', // Deep dark background
          800: '#171717', // Panel background
          700: '#262626', // Lighter panel/borders
          primary: '#8B5CF6', // Vivid violet
          secondary: '#3B82F6', // Blue accent
          accent: '#06B6D4', // Cyan accent
          highlight: '#F59E0B', // Amber highlight
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
      }
    },
  },
  plugins: [],
}

