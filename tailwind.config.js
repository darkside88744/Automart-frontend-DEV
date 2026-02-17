/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#e67e22", // Your automotive orange
        dark: "#2c3e50",  // Your professional dark blue
      }
    },
  },
  plugins: [],
}