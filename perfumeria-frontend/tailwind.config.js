/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'michova-black': '#000000',
        'michova-gold': '#FFD700',
        'michova-silver': '#C0C0C0'
      }
    },
  },
  plugins: [],
}