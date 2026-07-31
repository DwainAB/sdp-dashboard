/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#FAFAFA',
          100: '#F5F0EA',
          200: '#EAE2D9',
          300: '#D9CCC0',
          400: '#C0AC9C',
          500: '#9A8573',
          600: '#7A6554',
          700: '#5D4C3F',
          800: '#43362C',
          900: '#2B211B',
          950: '#1A1310',
        },
        indigo: {
          50: '#FBF6F1',
          100: '#F5EAE0',
          200: '#E9D5C2',
          300: '#D8B899',
          400: '#BC8F6B',
          500: '#996F56',
          600: '#855D47',
          700: '#6E4B39',
          800: '#5A3D2F',
          900: '#4A3327',
          950: '#2E211A',
        },
      },
    },
  },
  plugins: [],
}
