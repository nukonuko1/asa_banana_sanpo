/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        morning: {
          yellow: "#FFF8E1",
          orange: "#FFF3E0",
          green: "#F1F8E9",
          cream: "#FFFDE7",
          soft: "#FFF9F0",
        },
      },
      fontFamily: {
        sans: ["Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "sans-serif"],
      },
    },
  },
  plugins: [],
};
