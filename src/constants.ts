export const COLORS = {
  navy: "#0D162B",
  navyDeep: "#0A0D14",
  accent: "#2E75B6",
  accentSoft: "#427BBE",
  mist: "#DEEAF6",
  bg: "#F7FAFC",
  textPrimary: "#0D162B",
  textSecondary: "#5A6577",
};

/** International format, no + or spaces. Override with VITE_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, "") ||
  "94770000000";

export const STORE_NAME = "Trust Mobile";
export const STORE_TAGLINE = "Mobiles & accessories you can trust";
