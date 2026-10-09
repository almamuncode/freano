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
        income: "#5428df",
        expense: "#c64d16",
        brand: {
          DEFAULT: "#5428df",
          light: "#ff8038",
          dark: "#4320bb",
        },
        paper: "#f5f3fc",
        ink: "#211b39",
        brass: {
          DEFAULT: "#817493",
          light: "#a59bb6",
        },
        sage: "#5428df",
        rust: "#c64d16",
        hairline: "#e9e4f5",
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
