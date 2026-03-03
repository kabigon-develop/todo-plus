import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2937',
        mist: '#f8fafc',
        mint: '#10b981',
        amber: '#f59e0b'
      }
    }
  },
  plugins: [forms]
};
