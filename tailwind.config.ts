import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        income: "#16a34a",
        expense: "#dc2626",
        brand: {
          DEFAULT: "#4f46e5",
          light: "#818cf8",
          dark: "#3730a3",
        },
      },
    },
  },
  plugins: [],
};

export default config;
