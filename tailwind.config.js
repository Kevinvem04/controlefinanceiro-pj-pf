/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155'
        },
        profit: {
          neon: '#10b981',
          hover: '#34d399'
        },
        expense: {
          crimson: '#ef4444',
          hover: '#f87171'
        },
        active: {
          blue: '#3b82f6',
          hover: '#60a5fa'
        }
      }
    },
  },
  plugins: [],
}
