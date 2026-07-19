// KCHJ Brand Colors — shared reference for JS/TS usage.
// Prefer the Tailwind theme tokens / CSS variables; use these hexes only in
// inline styles or chart libraries that can't consume Tailwind classes.

export const KCHJ_COLORS = {
  navy: "#0b2443", // primary
  gold: "#b2892e", // accent
  navyDarkest: "#07162b",
  navyPanelEnd: "#0f1b2d",
  navyAccent: "#1a3c66", // hover / border
  onNavy: "#ebf0fd", // text on navy
  surface: "#f6f6fc",
  ksaGreen: "#006c35",
  // dark mode
  navyDark: "#0b1729",
  goldLight: "#cda434",
  // data-viz
  slateBlue: "#5b7a9d",
  linePale: "#dee8ff",
  success: "#16a34a",
  danger: "#dc2626",
  gradients: {
    authPanel: "linear-gradient(160deg, #0b2443 0%, #0f1b2d 100%)",
    dashboardHero:
      "linear-gradient(180deg, #07162b 0%, #0b2443 50%, #1a3c66 100%)",
  },
} as const;

export default KCHJ_COLORS;
