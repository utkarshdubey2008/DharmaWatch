/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FFFFFF',
          100: '#FAFAFA',
          200: '#F4F4F5',
          300: '#E4E4E7',
          400: '#D4D4D8',
          500: '#A1A1AA',
          600: '#71717A',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
        ink: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
        dw: {
          red: '#D97706',       // Mint Warm Amber Accent
          crimson: '#B45309',
          redBright: '#F59E0B',
          redDark: '#92400E',
          redLight: '#FFFBEB',
          black: '#000000',
          charcoal: '#111827',
          surface: '#F9FAFB',
          surface2: '#F3F4F6',
          border: '#E5E7EB',
          borderSubtle: '#F3F4F6',
          borderStrong: '#D1D5DB',
          rust: '#D97706',
          gold: '#F59E0B',
          saffron: '#D97706',
          navy: '#0F172A',
          accent: '#F59E0B',
          amber: '#F59E0B',
          amberDark: '#D97706',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        headline: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        'reading': '70ch',
      }
    },
  },
  plugins: [],
}
