/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        calm: {
          50: "#f0f4ff",
          100: "#e0eaff",
          200: "#c5d5fc",
          300: "#a3b9f8",
          400: "#7c96f1",
          500: "#5b74e8",
          600: "#4055d4",
          700: "#3344b8",
          800: "#2d3a95",
          900: "#1e2563",
        },
        sage: {
          50: "#f0faf4",
          100: "#d6f0e1",
          200: "#a9dfc3",
          300: "#72c69f",
          400: "#3eaa7b",
          500: "#258a61",
          600: "#1a6e4d",
          700: "#155840",
        },
        warm: {
          50: "#fff8f1",
          100: "#feecd9",
          200: "#fcd6b0",
          300: "#f9b97d",
          400: "#f4934a",
          500: "#ee7023",
        },
      },
      fontFamily: {
        sans: ["'Nunito'", "'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "typing": "typing 1.2s steps(3, end) infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        pulseSoft: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
        typing: { "0%": { content: "'●'" }, "33%": { content: "'● ●'" }, "66%": { content: "'● ● ●'" } },
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
