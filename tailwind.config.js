/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Core Identity — purple design system
        primary: "#4f378a",
        secondary: "#79747e",
        accent: "#cfbcff",
        "accent-primary": "#6750a4",
        
        // Semantic Backgrounds
        "bg-primary": "#fdf7ff",
        "bg-secondary": "#e9ddff",
        
        // Surfaces
        "surface-primary": "#fdf7ff",
        "surface-secondary": "#f3eeff",
        "surface-elevated": "#FFFFFF",
        "surface-variant": "#e9ddff",
        "surface-glass": "rgba(255, 255, 255, 0.7)",
        
        // Typography
        "text-primary": "#1d1b20",
        "text-secondary": "#49454f",
        "text-tertiary": "#79747e",
        
        // Borders
        "border-subtle": "#e6dff7",
        "border-strong": "#cac4d0",
        
        // State
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
    },
  },
  plugins: [],
};
