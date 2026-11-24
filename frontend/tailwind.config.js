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
          green: '#45A83D',
          'green-dark': '#287C36',
          'green-light': '#EAF6E8',
          navy: '#075080',
          blue: '#3A83B5',
          bg: '#F7FAFC',
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        english: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
