/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        accent: '#059669',
        danger: '#dc2626',
        surface: '#f8fafc',
      },
    },
  },
  plugins: [],
}
