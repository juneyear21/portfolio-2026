/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        doto: ['Doto', 'monospace'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        // We'll rely on CSS variables for the themes
        black: 'var(--black)',
        surface: 'var(--surface)',
        'surface-raised': 'var(--surface-raised)',
        border: 'var(--border)',
        'border-visible': 'var(--border-visible)',
        'text-disabled': 'var(--text-disabled)',
        'text-secondary': 'var(--text-secondary)',
        'text-mid': 'var(--text-mid)',
        'text-primary': 'var(--text-primary)',
        'text-display': 'var(--text-display)',
        'accent-red': 'var(--accent-red)',
        'utility-orange': 'var(--utility-orange)',
        success: 'var(--success)',
        warning: 'var(--warning)',
      },
      gap: {
        dashboard: 'var(--gap)',
      },
      borderRadius: {
        card: 'var(--radius)',
      },
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('theme-light', '.theme-light &');
    }
  ],
}
