// Sourced from ~/dev/duetto-frontend/src/core/styles/branding2026Colors.scss
// and themes.ts (color2026 export). Keep in sync when the production palette changes.

export const colors = {
  // Nav
  navBg: "#0E2124",        // brand.teal.grey / grey[900]
  navAccent: "#C4FF45",    // brand.teal[70]

  // Primary action (teal)
  primary: "#006461",      // main.blue[700]
  primaryHover: "#053C3C", // main.blue[900]
  primarySubtle: "#D7F7ED", // main.blue[50] — property chip bg

  // Text
  textPrimary: "#0E2124",  // text.primary
  textSecondary: "#4F5B60", // grey[700] / text.secondary
  textDisabled: "#AEB4BA", // grey[400] / text.disabled

  // Surfaces & borders
  pageBg: "#F5F5F5",       // grey[100]
  surfaceBg: "#FAFAFA",    // common.backgroundDefault
  white: "#FFFFFF",
  border: "#DDE1E2",       // grey[300]
  borderSubtle: "#AEB4BA", // grey[400]

  // Chips (legacy — used for restriction key chips in the form)
  chipProperty: "#D7F7ED", // main.blue[50]
  chipSegment: "#EAEEEF",  // grey[200]

  // Granularity chip colors — 4 distinct brand colors, non-semantic
  chipGranPropertyBg: "#D7F7ED",             // brand.teal[50] / primary teal
  chipGranPropertyText: "#006461",
  chipGranSegmentBg: "hsl(245 100% 95%)",    // brand.indigo[50] / brand.indigo[900]
  chipGranSegmentText: "hsl(245 48% 41%)",
  chipGranSubrateBg: "hsl(20 100% 95%)",      // brand.orange[50] / brand.orange[800] — not warning amber (hsl 35–42)
  chipGranSubrateText: "hsl(28 83% 37%)",
  chipGranRoomtypeBg: "hsl(60 59% 88%)",     // brand.olive[50] / brand.olive[700]
  chipGranRoomtypeText: "hsl(60 100% 21%)",

  // Semantic
  error: "#D32F2F",        // semantic.error[600]
  warningBorder: "hsl(35 90% 50%)",   // sem.warning[700]
  warningText: "hsl(36 100% 23%)",    // sem.warning[800]
  warningBg: "hsl(42 100% 94%)",      // sem.warning[50]

  // Brand
  avatar: "#FF5900",       // brand.orange[500]
} as const;

export const typography = {
  fontFamily: "Lato, sans-serif",
} as const;
