import forms from '@tailwindcss/forms';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          muted: 'var(--color-primary-muted)',
          fg: 'var(--color-primary-fg)',
          text: 'var(--color-primary-text)'
        },
        surface: {
          base: 'var(--surface-base)',
          card: 'var(--surface-card)',
          elevated: 'var(--surface-elevated)'
        },
        foreground: 'var(--text-foreground)',
        muted: 'var(--text-muted)',
        subtle: 'var(--text-subtle)',
        border: {
          DEFAULT: 'var(--border-default)',
          focus: 'var(--border-focus)'
        },
        priority: {
          high: 'var(--priority-high)',
          medium: 'var(--priority-medium)',
          low: 'var(--priority-low)'
        }
      }
    }
  },
  plugins: [forms, animate]
};
