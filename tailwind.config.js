/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        arisakaBgCosmicStart: "#040612",
        arisakaBgCosmicEnd: "#111C30",
        arisakaGlass: "rgba(255, 255, 255, 0.12)",
        arisakaGlassBorder: "rgba(255, 255, 255, 0.20)",
        arisakaDock: "rgba(20, 24, 38, 0.75)",
        arisakaBlueStart: "#3B82F6",
        arisakaBlueEnd: "#1D4ED8",
        arisakaGoldStart: "#FFD200",
        arisakaGoldEnd: "#FF7E00",
        arisakaGem: "#38BDF8",
        arisakaLevelStart: "#8B5CF6",
        arisakaLevelEnd: "#6D28D9",
        entGold: "#FFD700"
      },
      borderRadius: {
        pill: "14px",
        card: "18px",
        dock: "28px",
        btn: "24px"
      },
      fontFamily: {
        rounded: ["SF Pro Rounded", "sans-serif"]
      }
    },
  },
  plugins: [],
}
