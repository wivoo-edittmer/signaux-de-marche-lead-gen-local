import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'monospace'],
      },
      colors: {
        // Mistral Charter - Orange Version
        brand: {
          primary: '#FF7000',
          primaryLight: '#F5D90A',
          primaryMedium: '#FAA42B',
          primaryDark: '#FF9E00',
          gradient: 'linear-gradient(135deg, #F5D90A 0%, #FAA42B 25%, #FF9E00 75%, #FF7000 100%)',
        },
        // Mistral Charter - Green Version
        success: {
          50: '#A3E635',
          100: '#65C547',
          500: '#22C55E',
          700: '#16A34A',
          900: '#15803D',
          gradient: 'linear-gradient(135deg, #A3E635 0%, #65C547 25%, #22C55E 75%, #16A34A 100%)',
        },
        // Semantic Colors
        growth: '#16A34A',
        decline: '#FF7000',
        stable: '#6B7280',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
