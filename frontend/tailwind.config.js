/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design-System „Sonnig & Warm"
        primary: {
          DEFAULT: '#F5B731', // Marktgelb
          light: '#FDE68A', // Honiggelb
          bg: '#FFF8DC', // Cremesonne (Seiten-Hintergrund)
        },
        accent: {
          DEFAULT: '#FF8C5A', // Sommerkorall (CTAs)
          dark: '#E06930', // Korall dunkel (Hover)
        },
        ink: {
          DEFAULT: '#5A4A2A', // Karamell (Body-Text)
          dark: '#2E2416', // Tiefdunkel (Headlines, Navbar, Footer)
          light: '#9C856A', // Hellkaramell (Captions)
        },
        gold: '#EDCF88', // Trennlinien, Card-Borders
        surface: '#FFFFFF',
        // Alias: bestehende brand-*-Klassen auf das neue System abbilden
        brand: {
          50: '#FFF8DC',
          100: '#FDE68A',
          500: '#F5B731',
          600: '#FF8C5A',
          700: '#E06930',
          800: '#E06930',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Arial Narrow', 'sans-serif'],
        body: ['Nunito', '"Trebuchet MS"', 'sans-serif'],
        sans: ['Nunito', '"Trebuchet MS"', 'sans-serif'],
      },
      borderRadius: {
        lg: '20px',
        xl: '32px',
        pill: '999px',
      },
      boxShadow: {
        md: '0 4px 16px rgba(90,74,42,0.12)',
        lg: '0 8px 32px rgba(90,74,42,0.16)',
        xl: '0 16px 48px rgba(90,74,42,0.20)',
      },
    },
  },
  plugins: [],
};
