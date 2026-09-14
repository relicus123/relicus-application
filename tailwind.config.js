/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Core Identity — Relicus brand palette (#1C4966 / #8FBDD7)
        primary: "#1C4966",
        "primary-dark": "#12354A",
        "primary-hover": "#285B78",
        secondary: "#8FBDD7",
        accent: "#C99545",
        "accent-primary": "#1C4966",
        "accent-light": "#FBF1DF",
        "accent-dark": "#9A6C2D",
        
        // Semantic Backgrounds
        "bg-primary": "#F7F9FB",
        "bg-secondary": "#EDF5F8",
        
        // Surfaces
        "surface-primary": "#F7F9FB",
        "surface-secondary": "#EDF5F8",
        "surface-elevated": "#FFFFFF",
        "surface-variant": "#E1EFF5",
        "surface-blue": "#E1EFF5",
        "surface-subtle": "#EDF5F8",
        "surface-glass": "rgba(255, 255, 255, 0.85)",
        
        // Typography
        "text-primary": "#172F3D",
        "text-secondary": "#405563",
        "text-tertiary": "#71818B",
        "text-caption": "#87959D",
        "text-disabled": "#AAB5BB",
        
        // Borders
        "border-subtle": "#DCE5EA",
        "border-strong": "#C9D9E2",
        "border-focus": "#1C4966",
        
        // State
        success: "#287A5A",
        "success-bg": "#E8F4EE",
        warning: "#C99545",
        "warning-bg": "#FBF1DF",
        error: "#C45151",
        "error-bg": "#FBEAEA",
        info: "#1C4966",
        "info-bg": "#EDF5F8",
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
