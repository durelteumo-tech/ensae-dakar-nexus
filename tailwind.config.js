/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "rgb(var(--c-canvas) / <alpha-value>)",
        panel: "rgb(var(--c-panel) / <alpha-value>)",
        "panel-raised": "rgb(var(--c-raised) / <alpha-value>)",
        hairline: "rgb(var(--c-hairline) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          muted: "rgb(var(--c-muted) / <alpha-value>)",
        },
        volt: "rgb(var(--c-emerald) / <alpha-value>)",
        telemetry: "rgb(var(--c-primary) / <alpha-value>)",
        "primary-ink": "rgb(var(--c-primary-ink) / <alpha-value>)",
        signal: {
          mint: "rgb(var(--c-emerald) / <alpha-value>)",
          amber: "rgb(var(--c-amber) / <alpha-value>)",
          rose: "rgb(var(--c-rose) / <alpha-value>)",
          violet: "rgb(var(--c-violet) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "sans-serif"],
        sans: ["Golos Text", "sans-serif"],
        lostya: ["Golos Text", "sans-serif"],
        lovabella: ["Bricolage Grotesque", "sans-serif"],
        luckyfield: ["Golos Text", "sans-serif"],
        luckymoon: ["Bricolage Grotesque", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
