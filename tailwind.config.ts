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
        income: "#00b96b",
        expense: "#ff285c",
        brand: {
          DEFAULT: "#601bff",
          light: "#ff8038",
          dark: "#4510cc",
        },
        paper: "#f5f3fc",
        ink: "#171044",
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
