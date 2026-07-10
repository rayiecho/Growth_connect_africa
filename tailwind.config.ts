import type { Config } from "tailwindcss";

// Brand tokens pulled directly from growthconnect.africa's live site —
// see /BRAND.md for where each value came from.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#2FA36B",
          "green-dark": "#248257",
          charcoal: "#1F2937",
          slate: "#4B5563",
          line: "#E5E7EB",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
