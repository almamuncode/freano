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
        income: "#16803c",
        expense: "#d92d20",
        brand: {
          DEFAULT: "#0071e3",
          light: "#5aa7f6",
          dark: "#005bb5",
        },
        paper: "#f5f5f7",
        ink: "#1d1d1f",
        brass: {
          DEFAULT: "#6e6e73",
          light: "#86868b",
        },
        sage: "#166534",
        rust: "#b42318",
        hairline: "#d2d2d7",
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
