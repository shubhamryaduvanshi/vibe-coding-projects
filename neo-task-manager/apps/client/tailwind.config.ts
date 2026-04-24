import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#020202",
        accent: "#dc2626"
      },
      boxShadow: {
        soft: "0 20px 70px rgba(220, 38, 38, 0.15)"
      },
      backgroundImage: {
        "board-grid":
          "radial-gradient(circle at top, rgba(220,38,38,0.12), transparent 30%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
      },
      backgroundSize: {
        "board-grid": "auto, 24px 24px, 24px 24px"
      }
    }
  },
  plugins: []
} satisfies Config;

