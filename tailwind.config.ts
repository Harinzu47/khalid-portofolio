import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Terminal design system — hzcode.my.id
        terminal: {
          bg:         "#0d1117", // near-black background
          surface:    "#161b22", // card / panel background
          "surface-alt": "#21262d", // slightly lighter surface
          border:     "#30363d", // 1px borders
          primary:    "#7ee787", // terminal green (prompts, highlights, active)
          secondary:  "#79c0ff", // soft blue (links, tags)
          accent:     "#f78166", // warm red (Infra category, errors)
          purple:     "#d2a8ff", // purple (AI category)
          "text-primary":   "#e6edf3", // main readable text
          "text-secondary": "#8b949e", // muted descriptions
          "text-muted":     "#484f58", // timestamps, subtle labels
        },
        // Keep these for any residual usage
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        "marquee":    "marquee 30s linear infinite",
        "fade-in":    "fadeIn 0.5s ease-in",
        "slide-up":   "slideUp 0.5s ease-out",
        "blink":      "blink 1s step-end infinite",
        "typing":     "typing 1.5s steps(20) forwards",
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        typing: {
          "0%":   { width: "0" },
          "100%": { width: "100%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
