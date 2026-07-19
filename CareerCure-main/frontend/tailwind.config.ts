import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // KCHJ brand — Navy family
        navy: {
          DEFAULT: "#0b2443",
          darkest: "#07162b",
          panel: "#0f1b2d",
          accent: "#1a3c66",
          50: "#1a3c66",
          100: "#16294a",
          200: "#112142",
          300: "#0d173a",
          400: "#0b2443",
          500: "#091a33",
          600: "#07162b",
          700: "#05121f",
          800: "#030c15",
          900: "#02080d",
        },
        // KCHJ brand — Gold accent
        gold: {
          DEFAULT: "#b2892e",
          light: "#cda434",
        },
        // KCHJ surface (light app surface)
        cream: {
          DEFAULT: "#f6f6fc",
          50: "#f6f6fc",
          100: "#eef1fa",
          200: "#e4e8f5",
          300: "#d4dbeb",
          400: "#c2cbda",
          500: "#a9b3cc",
        },
        // Light KCHJ tokens
        ink: "#0b2443",
        paper: "#f6f6fc",
        surface: "#ffffff",
        line: "#e2e6f0",
        primary: {
          DEFAULT: "#0b2443",
          50: "#eef2f8",
          100: "#dbe4f1",
          200: "#b7c8e3",
          300: "#92acd4",
          400: "#5b7bb6",
          500: "#2f5694",
          600: "#1a3c66",
          700: "#0b2443",
          800: "#081d36",
          900: "#05152a",
        },
        "primary-d": "#1a3c66",
        "primary-dark": "#0b2443",
        accent: {
          DEFAULT: "#b2892e",
          light: "#cda434",
          50: "#f7f1e3",
          100: "#ecdcc0",
          500: "#cda434",
          600: "#b2892e",
          700: "#8f6d24",
        },
        "accent-d": "#cda434",
        success: "#16a34a",
        danger: "#dc2626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-in": "slide-in 0.3s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        pulse: "pulse-soft 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
