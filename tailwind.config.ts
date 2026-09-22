import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        income: "#2f8f3a",
        expense: "#d92d20",
        brand: {
          DEFAULT: "#318c3b",
          light: "#73d94d",
          dark: "#236b2d",
        },
        paper: "#f4f6f3",
        ink: "#171c18",
        brass: {
          DEFAULT: "#758078",
          light: "#929c94",
        },
        sage: "#166534",
        rust: "#b42318",
        hairline: "#e3e8e2",
      },
      fontFamily: {
        ledger: ["var(--font-ledger)", "Georgia", "serif"],
        "ledger-sans": ["var(--font-ledger-sans)", "Helvetica Neue", "sans-serif"],
        "ledger-mono": ["var(--font-ledger-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
