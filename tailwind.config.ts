import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['"Rubik Variable"', "sans-serif"],
        mono: ['"Fira Code"', "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Design system palette
        warm: {
          red: "#DC4E59",
          cyan: "#2EC4D5",
          violet: "#6C5CE7",
          amber: "#F6B93B",
          muted: "#788390",
          bg: "#FDF8F6",
          border: "#FFE8DE",
          divider: "#FFF0EA",
          separator: "#F5E6DE",
        },
        // Logo-derived palette — used on the landing page (`/`) only.
        // Pulled from the Retalio mark: electric blue + cyan + navy.
        cool: {
          blue: "#1F6FEB",
          blueLight: "#3D8DFE",
          cyan: "#3CC9DC",
          ink: "#0F1B33",
          muted: "#6B7A93",
          bg: "#F4F8FE",
          border: "#DCE8F8",
          divider: "#E5EEFB",
          separator: "#E1ECFB",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
        "shimmer-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "narrative-shimmer": {
          "0%": { "background-position": "-200% 0" },
          "100%": { "background-position": "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer-sweep": "shimmer-sweep 2.6s linear infinite",
        "narrative-shimmer": "narrative-shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
