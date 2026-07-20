/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'sans-serif'],
        'content': ['Lora', 'Georgia', 'serif'],
        'sans': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        emerald: {
          50: '#F0FAF3',
          100: '#E8F5EC',
          200: '#C8E7D0',
          300: '#A3D6B3',
          400: '#6BC285',
          500: '#4AC277',
          600: '#3DA863',
          700: '#2E8B4F',
          800: '#236B3D',
          900: '#1A4D2E',
        },
        amber: {
          50: '#FFFBF5',
          100: '#FFF5E6',
          200: '#FFE8CC',
          300: '#FFD4A8',
          400: '#F0C9A0',
          500: '#E5B88A',
          600: '#D4A373',
          700: '#B8864F',
          800: '#996633',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'wave': 'wave 0.7s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1.2)' },
        },
      },
    },
  },
  plugins: [],
}
