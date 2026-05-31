import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

const config: Config = {
  darkMode: ['class'],

  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2rem',
        '2xl': '2rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },

    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },

      colors: {
        bg: '#FAFAF8',
        surface: '#FFFFFF',
        'surface-2': '#F5F4F0',

        border: '#E5E3DC',
        'border-strong': '#CFCDC5',

        text: '#1A1A18',
        'text-2': '#5C5C58',
        'text-3': '#9C9A94',

        green: {
          50: '#F0FAF5',
          100: '#D8F3E4',
          200: '#B0E8CA',
          300: '#74D0A0',
          400: '#52B788',
          500: '#3A9E73',
          600: '#2D845E',
          700: '#256B4C',
          800: '#2D6A4F',
          900: '#1A3D2E',
        },

        amber: {
          50: '#FFFBF0',
          100: '#FEF9EC',
          200: '#FDF0C4',
          300: '#F9DE88',
          400: '#E9C46A',
          500: '#D4A82A',
          800: '#7D5A1E',
        },

        rose: {
          50: '#FFF5F2',
          100: '#FEF0EC',
          400: '#E76F51',
          800: '#7A2E1B',
        },

        success: '#2D6A4F',
        warning: '#E9C46A',
        danger: '#E76F51',
      },

      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },

      boxShadow: {
        sm: '0 1px 3px rgba(26,26,24,0.06)',
        md: '0 4px 16px rgba(26,26,24,0.08)',
        lg: '0 8px 32px rgba(26,26,24,0.10)',
        xl: '0 16px 48px rgba(26,26,24,0.12)',

        card:
          '0 2px 8px rgba(26,26,24,0.06), 0 0 0 1px rgba(26,26,24,0.04)',
      },

      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        shimmer: 'shimmer 1.6s linear infinite',
        float: 'float 6s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },

        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(12px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },

        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-8px)',
          },
        },

        pulseSoft: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.7',
          },
        },
      },

      backdropBlur: {
        xs: '2px',
      },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      typography: {
        DEFAULT: {
          css: {
            maxWidth: '75ch',
            color: '#1A1A18',

            h1: {
              fontWeight: '700',
            },

            h2: {
              fontWeight: '700',
            },

            h3: {
              fontWeight: '600',
            },

            a: {
              color: '#2D6A4F',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },

            code: {
              color: '#256B4C',
            },
          },
        },
      },
    },
  },

  plugins: [
    typography,
    forms,
    containerQueries,
  ],
}

export default config