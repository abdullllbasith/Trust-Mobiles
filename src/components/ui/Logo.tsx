import { Link } from "react-router-dom";

export function Logo({
  to = "/",
  className = "",
  size = "md",
}: {
  to?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const imgSize = size === "sm" ? "h-9 md:h-10" : "h-12 md:h-14";

  return (
    <Link to={to} className={`flex items-center gap-2 group ${className}`}>
      <img
        src={encodeURI("/TM-dark-land.png")}
        alt="Trust Mobile"
        className={`${imgSize} w-auto object-contain group-hover:opacity-80 transition-opacity`}
      />
    </Link>
  );
}
