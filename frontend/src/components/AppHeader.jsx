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
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-white group">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <PawPrint size={22} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">PawBack</span>
          </Link>
          {showNavLinks && <HeaderNavLinks />}
        </div>

        <div className="flex items-center gap-4">{children}</div>
      </div>
    </header>
  );
}
