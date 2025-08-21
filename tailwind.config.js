/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#ffffff',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        serif: ['var(--font-noto-serif)', 'serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        oswald: ['var(--font-oswald)', 'system-ui', 'sans-serif'],
        bricolage: [
          'var(--font-bricolage-grotesque)',
          'system-ui',
          'sans-serif',
        ],
        'jetbrains-mono': ['var(--font-jetbrains-mono)', 'monospace'],
        'noto-sans': ['var(--font-noto-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
