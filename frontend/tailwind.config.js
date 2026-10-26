/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F7FB',
        surface: {
          DEFAULT: '#FFFFFF',
          primary: '#FFFFFF',
          secondary: '#F0F4FA',
        },
        primary: {
          DEFAULT: '#2864E8',
          hover: '#1E52C6',
          secondary: '#5B8DEF',
          soft: '#EAF1FF',
        },
        text: {
          primary: '#182338',
          secondary: '#718096',
          muted: '#94A3B8',
        },
        border: {
          DEFAULT: '#E5EAF2',
          subtle: '#E5EAF2',
          strong: '#D0D9E6',
        },
        status: {
          success: '#16A36A',
          'success-soft': '#E6F7EF',
          warning: '#E9A23B',
          'warning-soft': '#FEF7EB',
          danger: '#DC5151',
          'danger-soft': '#FDECEC',
          info: '#2864E8',
          'info-soft': '#EAF1FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neu-subtle': '0 2px 8px rgba(24, 35, 56, 0.04), 0 1px 2px rgba(24, 35, 56, 0.02)',
        'neu-card': '0 4px 20px -2px rgba(24, 35, 56, 0.06), 0 2px 6px -1px rgba(24, 35, 56, 0.04)',
        'neu-elevated': '0 12px 30px -4px rgba(40, 100, 232, 0.08), 0 6px 16px -2px rgba(24, 35, 56, 0.04)',
        'neu-primary': '0 4px 14px 0 rgba(40, 100, 232, 0.28)',
        'neu-danger': '0 4px 14px 0 rgba(220, 81, 81, 0.28)',
        'neu-inner': 'inset 0 2px 4px 0 rgba(24, 35, 56, 0.04)',
      },
      borderRadius: {
        'card': '16px',
        'subtle': '12px',
      },
    },
  },
  plugins: [],
}
