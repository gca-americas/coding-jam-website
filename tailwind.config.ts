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
        gblue: "#4285F4",
        gred: "#EA4335",
        gyellow: "#FBBC04",
        ggreen: "#34A853",
        ink: "#202124",
        ash: "#5F6368",
        cloud: "#F8F9FA",
        line: "#E8EAED",
      },
      fontFamily: {
        display: ["'Google Sans Display'", "'Google Sans'", "Inter", "system-ui", "sans-serif"],
        sans: ["'Google Sans Text'", "'Google Sans'", "Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Roboto Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(60,64,67,.08), 0 2px 6px rgba(60,64,67,.06)",
        lift: "0 4px 12px rgba(60,64,67,.12), 0 2px 4px rgba(60,64,67,.06)",
        pop: "0 12px 28px rgba(60,64,67,.18), 0 6px 12px rgba(60,64,67,.10)",
      },
      keyframes: {
        bounceBar: {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        bar1: "bounceBar 1.1s ease-in-out infinite",
        bar2: "bounceBar 1.3s ease-in-out infinite 0.15s",
        bar3: "bounceBar 0.9s ease-in-out infinite 0.3s",
        bar4: "bounceBar 1.5s ease-in-out infinite 0.45s",
        floaty: "floaty 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
