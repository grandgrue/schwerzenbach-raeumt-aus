/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f1',
          100: '#d6ecdf',
          500: '#2f8f5b',
          600: '#26794c',
          700: '#1f6440',
        },
      },
    },
  },
  plugins: [],
};
