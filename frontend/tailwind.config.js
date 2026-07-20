/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0e14",
        surface: {
          DEFAULT: "#121a24",
          raised: "#18222f",
          hover: "#1e2a39",
        },
        line: {
          DEFAULT: "#26333f",
          strong: "#33475a",
        },
        content: {
          DEFAULT: "#e6edf3",
          muted: "#93a3b3",
          faint: "#5c6b7a",
        },
        accent: {
          DEFAULT: "#34e5b0",
          soft: "#7ff2d1",
          deep: "#12b389",
          glow: "rgba(52, 229, 176, 0.16)",
        },
        danger: {
          DEFAULT: "#ff6b6b",
          soft: "#ff9a9a",
          bg: "rgba(255, 107, 107, 0.1)",
        },
      },
      fontFamily: {
        display: ['"Chakra Petch"', "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 24px 60px -30px rgba(0, 0, 0, 0.9)",
        glow: "0 0 0 1px rgba(52, 229, 176, 0.35), 0 0 28px -6px rgba(52, 229, 176, 0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        scan: "scan 3.5s linear infinite",
      },
    },
  },
  plugins: [],
}
