import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172027",
        muted: "#5a6673",
        navy: "#12263f",
        teal: "#0f8b8d",
        "teal-deep": "#08676b",
        gold: "#b8862f",
        plum: "#7a2d4e",
        line: "#dfe6ea",
        paper: "#f6f8fb"
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Segoe UI", "Roboto", "Arial", "sans-serif"]
      },
      boxShadow: {
        premium: "0 18px 45px rgba(18, 38, 63, 0.12)",
        soft: "0 8px 24px rgba(18, 38, 63, 0.08)"
      },
      maxWidth: {
        site: "1180px"
      }
    }
  },
  plugins: []
};

export default config;
