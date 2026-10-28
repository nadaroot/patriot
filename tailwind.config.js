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
          950: '#000000',
          900: '#09090b',
          850: '#111113',
          800: '#18181b',
          700: '#27272a',
          600: '#3f3f46',
          500: '#71717a',
          400: '#a1a1aa',
          300: '#d4d4d8',
          100: '#f4f4f5',
          50: '#fafafa',
        },
        paper: {
          50: '#09090b',
          100: '#0f0f12',
          200: '#18181b',
          300: '#27272a',
          800: '#d4d4d8',
          900: '#fafafa',
        },
        accent: {
          primary: '#ffffff',
          muted: '#a1a1aa',
          border: '#27272a',
          glow: 'rgba(255, 255, 255, 0.08)',
        }
      },
      fontFamily: {
        serif: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
