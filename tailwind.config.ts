import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        card: '#1a1a24',
        'card-hover': '#252532',
        accent: '#6366f1',
        'accent-hover': '#818cf8',
        success: '#22c55e',
        winner: '#fbbf24',
        muted: '#71717a',
      },
    },
  },
  plugins: [],
};

export default config;
