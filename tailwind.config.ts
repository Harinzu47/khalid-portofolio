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
        // Dynamic Terminal Theme System (Mapped to CSS custom properties)
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
