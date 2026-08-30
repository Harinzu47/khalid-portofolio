import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Design Tokens (Google Stitch Project 7626222099040114874)
        "surface-main": "#F9F7F2",
        "surface-bright": "#fdf8f8",
        "surface-dim": "#ddd9d8",
        "surface-container": "#f1edec",
        "surface-container-high": "#ebe7e6",
        "surface-container-lowest": "#ffffff",
        "surface-terminal": "#121212",
        "text-primary": "#1A1A1A",
        "text-secondary": "#64748B",
        "border-subtle": "#E2E8F0",
        "accent-technical": "#1E293B",
        "terminal-green": "#4ADE80",
        "primary": "#1A1A1A",
        "on-primary": "#ffffff",
        "primary-container": "#1c1b1b",
        "secondary": "#515f74",
        "on-secondary": "#ffffff",
        "outline": "#747878",
        "outline-variant": "#c4c7c7",

        // Admin Console Terminal Tokens (Preserved for private OS console)
        terminal: {
          bg: "var(--terminal-bg)",
          surface: "var(--terminal-surface)",
          "surface-alt": "var(--terminal-surface-alt)",
          border: "var(--terminal-border)",
          primary: "var(--terminal-primary)",
          secondary: "var(--terminal-secondary)",
          accent: "var(--terminal-accent)",
          purple: "var(--terminal-purple)",
          warning: "var(--terminal-warning)",
          "text-primary": "var(--terminal-text-primary)",
          "text-secondary": "var(--terminal-text-secondary)",
          "text-muted": "var(--terminal-text-muted)",
        },
        background: "var(--terminal-bg)",
        foreground: "var(--terminal-text-primary)",
      },
      fontFamily: {
        headline: ["var(--font-geist)", "Geist", "Inter", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      spacing: {
        "gutter": "24px",
        "margin-desktop": "64px",
        "margin-mobile": "20px",
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
