// Single source of truth for brand colors used OUTSIDE plain CSS (e.g. inline
// SVG strings for map pins, canvas, etc. where CSS var() can't be used directly).
// These values must always match the --pp-* custom properties in
// src/styles/global.css — if you change a color, change it in BOTH places.
const theme = {
  orange: "#ff9d4d",
  orangeDark: "#f0812a",
  orangeSoft: "#fff1e2",
  green: "#34a866",
  greenDark: "#1f7d4c",
  greenSoft: "#e8f7ee",
  cream: "#fdfcfa",
  ink: "#26302a",
  muted: "#83897f",
  border: "#edeae2",
  danger: "#e05a4a",
  white: "#ffffff",
};

export default theme;
