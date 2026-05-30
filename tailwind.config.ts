import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#22d3ee',
          magenta: '#f0f',
          pink: '#ff2d95',
          purple: '#a855f7',
          blue: '#3b82f6',
        },
        ink: {
          900: '#05060f',
          800: '#0a0c1a',
          700: '#111426',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(34,211,238,0.5), 0 0 40px rgba(34,211,238,0.2)',
        'neon-pink': '0 0 20px rgba(255,45,149,0.5), 0 0 40px rgba(255,45,149,0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        scan: 'scan 3s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
