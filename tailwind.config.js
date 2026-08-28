/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Calm, trauma-informed palette. Never pure black/white, never
        // alarm-red as a dominant tone. Muted, grounded, low-saturation.
        mist: {
          50: '#F6F8F7',
          100: '#EEF2F0',
          200: '#DEE6E2'
        },
        sage: {
          400: '#8FAE9E',
          500: '#6E9587',
          600: '#557669',
          700: '#425D53'
        },
        dusk: {
          400: '#7E88A8',
          500: '#616C8E',
          600: '#4C5573'
        },
        ink: {
          400: '#5B6560',
          600: '#3A423E',
          800: '#232823'
        },
        risk: {
          low: '#6FA37B',
          moderate: '#D9A441',
          high: '#D67D3E',
          critical: '#C1594F'
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.06)', opacity: '1' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        breathe: 'breathe 4.5s ease-in-out infinite',
        fadeUp: 'fadeUp 0.5s ease-out both'
      }
    }
  },
  plugins: []
};
