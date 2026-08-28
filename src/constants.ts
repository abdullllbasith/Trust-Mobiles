export const COLORS = {
  charcoal: "#1C1C1C",
  charcoalDeep: "#1A1A1B",
  gold: "#C5A059",
  goldBright: "#D4AF37",
  goldDeep: "#996515",
  mist: "#F3EBD8",
  bg: "#F8F6F1",
  textPrimary: "#1C1C1C",
  textSecondary: "#5C574F",
  // legacy aliases
  navy: "#1C1C1C",
  navyDeep: "#1A1A1B",
  accent: "#C5A059",
  accentSoft: "#D4AF37",
};

/** International format, no + or spaces. Override with VITE_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, "") ||
  "94770000000";

export const STORE_NAME = "Trust Mobile";
export const STORE_TAGLINE = "The Phone Store";
