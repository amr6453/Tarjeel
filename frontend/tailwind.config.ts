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
        background: "var(--background)",
        foreground: "var(--foreground)",
        tarjeel: {
          50: "#FAF8F5",
          100: "#F5EFE3",
          200: "#EBE0CC",
          300: "#DCBA78",
          400: "#C99F4E",
          500: "#B88836",
          600: "#9E7025",
          700: "#7E561A",
          800: "#603F12",
          900: "#492F0C",
          950: "#2B1A05",
        },
        sand: {
          50: "#FDFCF9",
          100: "#F7F4EC",
          200: "#EDE7D9",
          300: "#DFD5C0",
          400: "#C8BA9F",
          500: "#AB9A7C",
          600: "#8B7B60",
          700: "#695C46",
          800: "#473E2F",
          900: "#2A241A",
          950: "#17130E",
        },
        gold: {
          50: "#FFFDF7",
          100: "#FEF9EC",
          200: "#FDF0D0",
          300: "#F9E1A3",
          400: "#F3CD6E",
          500: "#E3B33C",
          600: "#C59325",
          700: "#9C7018",
          800: "#7C5614",
          900: "#644412",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
        "pill": "9999px",
        "arch": "100px 100px 0 0",
      },
      boxShadow: {
        "soft-sm": "0 2px 10px -2px rgba(180, 131, 62, 0.06)",
        "soft-md": "0 8px 30px -4px rgba(180, 131, 62, 0.08)",
        "soft-lg": "0 20px 40px -8px rgba(180, 131, 62, 0.12)",
        "ambient": "0 0 50px 10px rgba(220, 186, 120, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;

