
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          secondary: '#FF6B35',
          accent: '#FFD700',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          background: '#F8F9FA',
        },
        text: {
          DEFAULT: '#1A1A1A',
          secondary: '#6B7280',
        },
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', '1.5'],
        sm: ['0.875rem', '1.5'],
        base: ['1rem', '1.5'],
        lg: ['1.125rem', '1.5'],
        xl: ['1.25rem', '1.5'],
        '2xl': ['1.5rem', '1.25'],
        '3xl': ['1.875rem', '1.25'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #000000 0%, #FF6B35 50%, #FFD700 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)',
      },
    },
  },
  plugins: [],
}
