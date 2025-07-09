module.exports = {
  darkMode: 'class',
  content: [
    "./**/*.{html,js}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          800: '#1f2937',
          900: '#111827',
        },
        blue: {
          900: '#1e3a8a',
          800: '#1e40af',
          700: '#1d4ed8',
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
          200: '#bfdbfe',
          100: '#dbeafe',
          50: '#eff6ff',
        },
      },
    },
  },
  plugins: [],
}
