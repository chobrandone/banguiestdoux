/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Adaptive accent: black in light mode, white in dark mode ── */
        gold: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          50:  '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#C4C4C4',
          400: '#9B9B9B',
          500: '#737373',
          600: '#4A4A4A',
          700: '#2E2E2E',
          800: '#1A1A1A',
          900: '#0A0A0A',
        },
        beige: {
          DEFAULT: '#F5F0E8',
          50:  '#FDFCF9',
          100: '#FAF8F3',
          200: '#F5F0E8',
          300: '#EDE4D3',
          400: '#E3D7BC',
          500: '#D5C49E',
        },
        night: {
          DEFAULT: '#0A0A0A',
          50:  '#1A1A1A',
          100: '#141414',
          200: '#0F0F0F',
          300: '#0A0A0A',
        },
        tropical: {
          green:  '#2A2A2A',
          amber:  '#D4622A',
          blue:   '#1B4F8A',
          purple: '#4A1F6B',
        },
      },
      fontFamily: {
        sans:      ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display:   ['var(--font-playfair)', 'Georgia', 'serif'],
        editorial: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-night':    'linear-gradient(135deg, #0A0A0A 0%, #1a0a2e 50%, #0A0A0A 100%)',
        'gradient-gold':     'linear-gradient(135deg, #FFFFFF 0%, #CCCCCC 50%, #FFFFFF 100%)',
        'gradient-tropical': 'linear-gradient(135deg, #0A0A0A 0%, #2A2A2A 100%)',
        'gradient-luxury':   'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.8) 100%)',
        'hero-overlay':      'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 100%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-left': 'slideLeft 0.5s ease-out forwards',
        'slide-right':'slideRight 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'ticker':     'ticker 30s linear infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideLeft: {
          '0%':   { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,255,255,0.15)' },
          '50%':      { boxShadow: '0 0 40px rgba(255,255,255,0.35)' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'night':      '0 4px 30px rgba(0,0,0,0.5)',
        'glass':      '0 8px 32px rgba(0,0,0,0.2)',
        'card':       '0 2px 20px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.15)',
        'gold':       '0 4px 20px rgba(0,0,0,0.12)',
        'gold-lg':    '0 8px 30px rgba(0,0,0,0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        xs: '480px',
      },
      spacing: {
        '18':  '4.5rem',
        '88':  '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
  ],
};
