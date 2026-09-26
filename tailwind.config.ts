import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#26333D",
        muted: "#56616B",
        navy: "#14283F",
        teal: "#176B65",
        "teal-deep": "#176B65",
        gold: "#B08D57",
        line: "#DCDEDB",
        paper: "#F8F7F3",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      boxShadow: {
        premium: "0 18px 45px rgba(18, 38, 63, 0.12)",
        soft: "0 8px 24px rgba(18, 38, 63, 0.08)",
      },
      maxWidth: {
        site: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
