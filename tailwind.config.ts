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
        // Ledger palette, used only in the admin panel
        paper: "#F7F3E9",
        ink: "#20293A",
        brass: {
          DEFAULT: "#8A6324",
          light: "#B08838",
        },
        sage: "#4B6B4F",
        rust: "#8C3B2E",
        hairline: "#DDD4BE",
      },
      fontFamily: {
        ledger: ["var(--font-ledger)", "serif"],
        "ledger-sans": ["var(--font-ledger-sans)", "sans-serif"],
        "ledger-mono": ["var(--font-ledger-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
