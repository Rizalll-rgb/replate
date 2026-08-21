import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#1B3A5C',
          gold: '#D4A843',
          green: '#2D8A4E',
          orange: '#E67E22',
          red: '#C0392B',
        },
      },
    },
  },
  plugins: [],
};

export default config;
