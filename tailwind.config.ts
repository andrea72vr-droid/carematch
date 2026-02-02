import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7ff",
          100: "#e2e7ff",
          200: "#c0c9ff",
          300: "#9ca9ff",
          400: "#7584ff",
          500: "#4f5eff",
          600: "#343fe6",
          700: "#262fba",
          800: "#1c238d",
          900: "#151a66"
        }
      }
    }
  },
  plugins: []
};

export default config;

