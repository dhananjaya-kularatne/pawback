import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
import HeaderNavLinks from "./HeaderNavLinks";

// The one header bar shared by every page — same gradient, width, padding and
// brand mark on the landing page and the authenticated app, so the views keep
// the same shape when you move between them. The right-hand slot is passed in
// as children (sign-in buttons, or the bell + account menu).
export default function AppHeader({ showNavLinks = true, children }) {
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 border-b border-blue-800/40">
      <div className="w-full px-6 md:px-10 lg:px-16 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link to="/" className="justify-self-start flex items-center gap-2 text-white group">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <PawPrint size={22} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">PawBack</span>
        </Link>

        <div className="justify-self-center">
          {showNavLinks && <HeaderNavLinks />}
        </div>

        <div className="justify-self-end flex items-center gap-4">{children}</div>
      </div>
    </header>
  );
}
