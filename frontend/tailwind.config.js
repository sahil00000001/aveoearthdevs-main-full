/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern emerald-based brand colors
        'brand': {
          50: '#ecfdf5',
          100: '#d1fae5', 
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // emerald-500 - primary brand color
          600: '#059669', // emerald-600 - primary action color
          700: '#047857', // emerald-700 - primary text/logo color
          800: '#065f46',
          900: '#064e3b',
        },
        
        // Legacy support - map to emerald equivalents
        'green-primary': '#047857', // emerald-700
        'green-secondary': '#059669', // emerald-600
        'green-accent': '#10b981', // emerald-500
        'green-light': '#d1fae5', // emerald-100
        'green-subtle': '#ecfdf5', // emerald-50
        
        // Eco colors - modern emerald palette
        'eco-primary': '#047857', // emerald-700
        'eco-secondary': '#059669', // emerald-600
        'eco-accent': '#10b981', // emerald-500
        'eco-light': '#d1fae5', // emerald-100
        'eco-subtle': '#ecfdf5', // emerald-50
        'carbon-neutral': '#065f46', // emerald-800
        'organic': '#34d399', // emerald-400
        'renewable': '#6ee7b7', // emerald-300
        
        // Semantic colors
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'error': 'var(--color-error)',
        'info': 'var(--color-info)',
        
        // Modern surface colors
        'background': '#f9fafb', // gray-50
        'surface': '#ffffff', // white
        'surface-elevated': '#f3f4f6', // gray-100
        
        // Modern text colors
        'text-primary': '#111827', // gray-900
        'text-secondary': '#374151', // gray-700
        'text-tertiary': '#6b7280', // gray-500
        
        // Neutral scale
        'neutral': {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        }
      },
      fontFamily: {
        'sans': 'var(--font-sans)',
        'mono': 'var(--font-mono)',
        'eb-garamond': 'var(--font-eb-garamond)',
        'reem': ["var(--font-reemkufi)", "sans-serif"],
        'poppins': ["var(--font-poppins)", "sans-serif"],
        'inter': ["Inter", "sans-serif"],
        'nunito': ["Nunito Sans", "sans-serif"],
        'dancing-script': ['Dancing Script', 'cursive'],
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
        '6xl': 'var(--text-6xl)',
      },
      lineHeight: {
        'none': 'var(--leading-none)',
        'tight': 'var(--leading-tight)',
        'snug': 'var(--leading-snug)',
        'normal': 'var(--leading-normal)',
        'relaxed': 'var(--leading-relaxed)',
        'loose': 'var(--leading-loose)',
      },
      spacing: {
        '0': 'var(--spacing-0)',
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
        '24': 'var(--spacing-24)',
      },
      boxShadow: {
        card: "0 6px 24px rgba(0,0,0,0.06)",
        'card-hover': "0 12px 32px rgba(0,0,0,0.10)",
      },
      backgroundImage: {
        'gradient-moss': 'linear-gradient(135deg, #10b981 0%, #047857 100%)', // emerald-500 to emerald-700
        'gradient-emerald': 'linear-gradient(135deg, #059669 0%, #047857 100%)', // emerald-600 to emerald-700
        'gradient-brand': 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', // emerald-50 to emerald-100
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(10px, -10px) scale(1.05)' },
          '66%': { transform: 'translate(-10px, 10px) scale(0.95)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-in-up': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slideInUp': {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        blob: 'blob 12s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'slide-in-up': 'slide-in-up 300ms ease-out both',
        'slideInUp': 'slideInUp 0.6s ease-out forwards',
      }
    },
  },
  plugins: [],
};
