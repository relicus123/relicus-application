/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1C4966",
        secondary: "#5F8B70",
        background: "#FFFFF0",
        accent: "#8FBDD7",
        mint: "#DDEEE3",
        softGray: "#F5F7FA",
        success: "#5CB85C",
        warning: "#F0AD4E",
        danger: "#D9534F",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
