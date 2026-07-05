import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#05070d",
        panel: "#0d111c",
        border: "rgba(255,255,255,0.08)",
        accent: "#3b82f6",
        good: "#22c55e",
        bad: "#ef4444",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
