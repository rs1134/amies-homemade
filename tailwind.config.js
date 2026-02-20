/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: '#F04E4E',
        yellow: '#F6C94C',
        cream: '#FFF8EE',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        script: ['Pacifico', 'cursive'],
        rounded: ['Fredoka', 'sans-serif'],
      }
    },
  },
  plugins: [],
}