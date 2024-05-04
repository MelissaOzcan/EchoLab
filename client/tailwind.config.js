/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#070F2B",
        secondary: "#1B1A55",
        greyishPurple: "#535C91",
        lightPurple: "#9290C3",
        lightGray: "#F7F7F7",
        coverLetterBlue: "#214ad0",
        background_dark: "#141414",
        midGrey: "#282828",
        deepPurple: "#230046",
        midPurple: "#320064",

      },
      fontFamily: {
        body: ["Poppins", "Exo 2", "sans-serif"],
      },
    },
  },
  plugins: [],
};
