/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#5f6961',
          light: '#7a847c',
          dark: '#4a534c',
        },
        cream: {
          DEFAULT: '#faf8f5',
          dark: '#f0eade',
        },
        'warm-gray': '#e6e0d0',
        charcoal: {
          DEFAULT: '#2c2c2c',
          light: '#6b6b6b',
        },
        mauve: {
          DEFAULT: '#84675a',
          light: '#bb9c87',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Cormorant', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
