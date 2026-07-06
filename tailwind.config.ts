import type { Config } from "tailwindcss";

// Brand tokens pulled directly from growthconnect.africa's live site —
// see /BRAND.md for where each value came from.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#2FA36B",       // primary accent — buttons, active states, underline marks
          "green-dark": "#248257",
          charcoal: "#1F2937",    // headings, nav, logo wordmark
          slate: "#4B5563",       // body text
          line: "#E5E7EB",        // hairlines, input borders
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
