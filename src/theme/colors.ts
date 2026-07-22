/**
 * Arisaka.ai Design System Color Tokens
 */

export const ArisakaColors = {
  backgrounds: {
    cosmic: ["#040612", "#111C30"],
    battle: ["#200838", "#941966"],
    emerald: ["#051919", "#0F4B37"],
    volcano: ["#181818", "#5A0A0A"],
  },
  glass: {
    surface: "rgba(255, 255, 255, 0.12)",
    surfaceHover: "rgba(255, 255, 255, 0.18)",
    border: "rgba(255, 255, 255, 0.20)",
    dock: "rgba(20, 24, 38, 0.75)",
  },
  accents: {
    primaryButton: ["#3B82F6", "#1D4ED8"], // Play button vibrant blue gradient
    primaryShadow: "rgba(59, 130, 246, 0.60)",
    gold: ["#FFD200", "#FF7E00"], // Gold coins / progress bar
    goldShadow: "rgba(255, 149, 0, 0.55)",
    gem: "#38BDF8", // Gems cyan accent
    levelBadge: ["#8B5CF6", "#6D28D9"], // Level badge purple gradient
  },
  text: {
    primary: "#FFFFFF",
    secondary: "rgba(255, 255, 255, 0.70)",
    muted: "rgba(255, 255, 255, 0.45)",
    gold: "#FFD700",
    gem: "#38BDF8",
  },
  radii: {
    pills: 14,
    cards: 18,
    dock: 28,
    button: 24,
  }
} as const;
