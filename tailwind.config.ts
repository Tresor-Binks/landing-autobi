import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16a34a",
          hover: "#15803d",
        },
        dark: {
          bg: "#111827",
          text: "#111827",
        },
        light: {
          bg: "#f9fafb",
        },
      },
      borderRadius: {
        '4xl': '2.5rem',
      },
    },
  },
  plugins: [], // On vide les plugins
};
export default config;