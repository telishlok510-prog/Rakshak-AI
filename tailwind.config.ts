import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette from project documentation (section 3.2)
        primary: "#1A3C6E", // Deep Blue (Trust)
        accent: "#FF9933", // Saffron Orange (Identity)
        danger: "#D32F2F", // Red (Warning / Scam)
        safe: "#2E7D32", // Green (Safe)
        canvas: "#F9F9F6", // Off-white (Background)
      },
      fontSize: {
        // Larger base sizes for low-vision / elderly users
        base: ["1.125rem", { lineHeight: "1.75rem" }],
        lg: ["1.25rem", { lineHeight: "1.9rem" }],
        xl: ["1.5rem", { lineHeight: "2rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
