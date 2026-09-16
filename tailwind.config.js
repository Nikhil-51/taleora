// code by Nikhil-51
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFD700", // Gold
        background: "#0B0E14", // Matte Deep Slate/Black
        card: "#151921", // Lighter Slate
        text: "#F8FAFC", // High Contrast Off-white
        secondary: "#94A3B8", // Muted Blue-Grey
        accent: "#6366F1", // Indigo
        success: "#10B981",
        error: "#EF4444",
        border: "#2D3748",
      }
    },
  },
  plugins: [],
}
