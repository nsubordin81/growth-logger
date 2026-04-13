/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
      },
      colors: {
        ink: '#0d0d0d',
        paper: '#111318',
        surface: '#1a1d24',
        border: '#2a2d35',
        muted: '#4a4d58',
        dim: '#6b7080',
        text: '#c8ccd8',
        bright: '#e8ecf4',
        amber: '#f59e0b',
        green: '#10b981',
        blue: '#3b82f6',
        red: '#ef4444',
        purple: '#8b5cf6',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateX(-8px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        fadeUp: { from: { transform: 'translateY(12px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        pulseDot: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
      },
    },
  },
  plugins: [],
}
