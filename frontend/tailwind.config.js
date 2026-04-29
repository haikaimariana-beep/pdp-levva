/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        yellow: { DEFAULT: '#FACC15', 400: '#FACC15', 500: '#EAB308' },
        dark: { DEFAULT: '#0A0A0A', 800: '#171717', 700: '#1C1C1C', 600: '#262626' },
      },
    },
  },
  plugins: [],
}
