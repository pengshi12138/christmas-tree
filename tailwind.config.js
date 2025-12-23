
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        luxury: ['Cinzel', 'serif'],
        body: ['Playfair Display', 'serif'],
        script: ['Monsieur La Doulaise', 'cursive'],
      },
    },
  },
  plugins: [],
}
