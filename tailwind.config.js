/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#E8F3FF",
          100: "#B9D8FF",
          200: "#8AB9FF",
          300: "#5B9AFF",
          400: "#2C7BFF",
          500: "#165DFF",
          600: "#0E42CC",
          700: "#0A2E99",
          800: "#061F66",
          900: "#031033",
        },
        success: {
          50: "#E8FFF0",
          100: "#B8FFD0",
          200: "#88FFB0",
          300: "#58FF90",
          400: "#28FF70",
          500: "#00B42A",
          600: "#008C20",
          700: "#006616",
          800: "#00400E",
          900: "#001A06",
        },
        warning: {
          50: "#FFF5E8",
          100: "#FFE0B8",
          200: "#FFCB88",
          300: "#FFB658",
          400: "#FFA128",
          500: "#FF7D00",
          600: "#CC6400",
          700: "#994B00",
          800: "#663200",
          900: "#331900",
        },
        danger: {
          50: "#FFECEC",
          100: "#FFC4C4",
          200: "#FF9C9C",
          300: "#FF7474",
          400: "#FF4C4C",
          500: "#F53F3F",
          600: "#CC2A2A",
          700: "#991F1F",
          800: "#661414",
          900: "#330A0A",
        },
        dark: {
          50: "#F7F8FA",
          100: "#E5E6EB",
          200: "#C9CDD4",
          300: "#86909C",
          400: "#4E5969",
          500: "#272E3B",
          600: "#1D2129",
          700: "#15181E",
          800: "#0E1014",
          900: "#07080A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.12)",
        glow: "0 0 40px rgba(22, 93, 255, 0.3)",
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, #0E1014 0%, #15181E 50%, #1D2129 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(22, 93, 255, 0.1) 0%, rgba(0, 180, 42, 0.05) 100%)",
        "gradient-glow": "radial-gradient(ellipse at top, rgba(22, 93, 255, 0.15) 0%, transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "count-up": "countUp 1s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
