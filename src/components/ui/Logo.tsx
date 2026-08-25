import { Link } from "react-router-dom";

export function Logo({
  to = "/",
  variant = "light",
  className = "",
  size = "md",
}: {
  to?: string;
  variant?: "light" | "dark";
  className?: string;
  size?: "sm" | "md";
}) {
  const src =
    variant === "dark"
      ? "/logo-dark.png"
      : encodeURI("/logo Trust mobile-light-bg-v1.png");

  const imgSize = size === "sm" ? "h-8 md:h-9" : "h-12 md:h-14";

  return (
    <Link to={to} className={`flex items-center gap-2 group ${className}`}>
      <img
        src={src}
        alt="Trust Mobile"
        className={`${imgSize} w-auto object-contain group-hover:opacity-80 transition-opacity`}
      />
    </Link>
  );
}
