import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Breakpoints customizados para melhor suporte a dispositivos
    screens: {
      'xs': '375px',    // iPhone SE, dispositivos pequenos
      'sm': '640px',    // Mobile landscape, tablets pequenos
      'md': '768px',    // Tablets portrait
      'lg': '1024px',   // Tablets landscape, laptops pequenos
      'xl': '1280px',   // Desktops
      '2xl': '1536px',  // Desktops grandes
    },
    extend: {
      // Safe area para dispositivos com notch (iPhone X+)
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      padding: {
        'safe': 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      },
      // Min height com viewport height dinâmico
      minHeight: {
        'screen-dvh': '100dvh',
        'screen-svh': '100svh',
        'screen-lvh': '100lvh',
      },
      height: {
        'screen-dvh': '100dvh',
        'screen-svh': '100svh',
        'screen-lvh': '100lvh',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        dyslexic: ['var(--font-opendyslexic)'],
      },
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'errorProgress': {
          '0%': { height: '100%' },
          '100%': { height: '0%' },
        },
      },
      animation: {
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'error-progress': 'errorProgress 3s linear forwards',
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'var(--font-geist-sans)',
            color: 'var(--text-primary)',
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#2563eb',
              },
            },
            // ... outras personalizações
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config