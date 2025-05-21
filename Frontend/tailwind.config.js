/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#fbbf24', // amarillo oscuro
          light: '#fde68a',
          dark: '#b45309',
        },
        background: {
          DEFAULT: '#18181b', // fondo principal
          light: '#27272a',
          dark: '#09090b',
        },
        surface: {
          DEFAULT: '#23232a',
          light: '#2a2a31',
          dark: '#18181b',
        },
        accent: {
          DEFAULT: '#fbbf24',
        },
        border: '#27272a',
        text: {
          DEFAULT: '#e5e7eb',
          muted: '#a1a1aa',
        },
      },
    },
    darkMode: 'class',
  },
  plugins: [],
} 