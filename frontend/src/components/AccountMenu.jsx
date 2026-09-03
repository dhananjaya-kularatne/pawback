import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, LayoutDashboard } from "lucide-react";

// Account dropdown shared by the authenticated Navbar and the landing-page
// header: avatar button, a Dashboard link and a Log out action. `onLoggedOut`
// lets the caller react after logout (e.g. the landing page flips its local
// auth state); when omitted it simply sends the user home.
export default function AccountMenu({ onLoggedOut }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close the dropdown when clicking anywhere outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use the stored owner name for the avatar initial and label, with a fallback
  let displayName = "";
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.name) displayName = user.name;
  } catch {
    // Ignore a malformed user payload — fall back to the generic label
  }
  const firstName = displayName ? displayName.split(" ")[0] : "Account";
  const initial = (displayName || "A").charAt(0).toUpperCase();

  // Clears the JWT and user data, then hands control back to the caller
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    if (onLoggedOut) {
      onLoggedOut();
    } else {
      navigate("/");
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((open) => !open)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full
                   border border-white/30 hover:bg-white/10
                   cursor-pointer transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-medium text-blue-800">
          {initial}
        </div>
        <span className="text-sm text-white">{firstName}</span>
        <ChevronDown size={14} className="text-blue-200" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-20">
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                       hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                       hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
