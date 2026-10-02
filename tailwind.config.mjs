/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        inkwell: {
          DEFAULT: '#2c3538',
          light: '#5c6a6c',
        },
        peacock: '#3f4f4f',
        camel: {
          DEFAULT: '#a27c5b',
          light: '#c2aa94',
        },
        brown: '#70563d',
        chai: '#ddd7c9',
        cream: '#f8f6f1',
        'warm-gray': '#d6d0c2',
      },
      fontFamily: {
        serif: ['roseritta', 'Georgia', 'serif'],
        sans: ['merel', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
