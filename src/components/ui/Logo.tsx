import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <img
        src="/matrix.png"
        alt="Matrix Mobiles"
        className="h-14 md:h-16 w-auto group-hover:opacity-80 transition-opacity"
      />
    </Link>
  );
}
