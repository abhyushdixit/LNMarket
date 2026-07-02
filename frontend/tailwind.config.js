/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#0F172A',
        electric: '#6D28D9',
        cyber: '#06B6D4'
      }
    },
  },
  plugins: [],
}