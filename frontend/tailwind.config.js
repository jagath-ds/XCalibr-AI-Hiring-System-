/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#22c55e', // main green
        'primary-dark': '#16a34a',
        'secondary': '#f9b52a', // yellow/orange for warnings
        'light': '#f8fafc', // lightest background
        'dark': '#0f172a', // dark text/elements
        'slate': { // shades of gray
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          800: '#1e293b',
        },
      }
    },
  },
  plugins: [],
}