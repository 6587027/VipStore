/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🆕 Admin Theme (Blue)
        admin: {
          primary: '#1E40AF',      // Blue 700
          secondary: '#3B82F6',    // Blue 500
          light: '#DBEAFE',        // Blue 100
          dark: '#1E3A8A',         // Blue 800
          bg: '#F8FAFC',           // Slate 50
          border: '#E2E8F0',       // Slate 200
          text: '#1E293B',         // Slate 800
        },
        // 🆕 Customer Theme (Green)
        customer: {
          primary: '#059669',      // Emerald 600
          secondary: '#10B981',    // Emerald 500
          light: '#D1FAE5',        // Emerald 100
          dark: '#047857',         // Emerald 700
          bg: '#F0FDF4',          // Green 50
          border: '#D1D5DB',       // Gray 300
          text: '#1F2937',         // Gray 800
        },
        // Keep existing primary colors
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}