/** @type {import('tailwindcss').Config} */
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
        burgundy: {
          50:  "#fdf2f2",
          100: "#fce8e8",
          200: "#f8d1d1",
          300: "#f2adb0",
          400: "#e87880",
          500: "#d94a56",
          600: "#c02d3a",
          700: "#a0202e",
          800: "#861d29",
          900: "#6b0b0c",
          950: "#450006",
        },
        frost: {
          DEFAULT: "#f2f7f9",
          50:  "#f2f7f9",
          100: "#e3edf2",
          200: "#c8dce7",
          300: "#a3c4d5",
          400: "#76a5be",
          500: "#5589a8",
          600: "#42708f",
          700: "#375b74",
          800: "#304e62",
          900: "#2c4253",
        },
        gold: {
          light: "#f7d98b",
          DEFAULT: "#d4a843",
          dark: "#9e7b23",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      backgroundImage: {
        "burgundy-gradient": "linear-gradient(135deg, #6b0b0c 0%, #450006 100%)",
        "frost-gradient": "linear-gradient(135deg, #f2f7f9 0%, #e3edf2 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(107, 11, 12, 0.12)",
        "glass-sm": "0 4px 16px 0 rgba(107, 11, 12, 0.08)",
        "glass-lg": "0 16px 48px 0 rgba(107, 11, 12, 0.18)",
        card: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-left": "slideInLeft 0.35s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "ticker-scroll": "tickerScroll 30s linear infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        tickerScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
