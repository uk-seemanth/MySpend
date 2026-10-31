/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        olive: {
          DEFAULT: "rgb(var(--olive) / <alpha-value>)",
          dark: "rgb(var(--olive-dark) / <alpha-value>)",
          on: "rgb(var(--on-olive) / <alpha-value>)", // text on olive buttons
        },
        // green → red budget scale (same in both themes)
        health: {
          safe: "#5FA96B",
          caution: "#A8AD3A",
          warning: "#E08A2E",
          danger: "#D64545",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -6px rgb(var(--shadow) / 0.12)",
        lift: "0 14px 32px -8px rgb(var(--shadow) / 0.22)",
      },
    },
  },
  plugins: [],
};
