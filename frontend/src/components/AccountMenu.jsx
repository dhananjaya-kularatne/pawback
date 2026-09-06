import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";

// Account control shared by the authenticated Navbar and the landing-page
// header: the signed-in name in the bar, opening a menu with the account
// email and a Log out action. `onLoggedOut` lets the caller react after
// logout (e.g. the landing page flips its local auth state); when omitted
// it sends the user home.
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

  // Pull the stored owner details for the label and menu header
  let displayName = "";
  let email = "";
  try {
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    if (user && user.name) displayName = user.name;
    if (user && user.email) email = user.email;
  } catch {
    // Ignore a malformed user payload — fall back to the generic label
  }

  // Clears the JWT and user data, then hands control back to the caller
  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
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
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="flex items-center gap-1.5 rounded text-sm font-medium text-white
                   hover:text-blue-100 cursor-pointer transition-colors
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <span className="max-w-[10rem] truncate">{displayName || "Account"}</span>
        <ChevronDown
          size={15}
          className={`text-blue-200 transition-transform ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
          <div className="px-3 py-2.5">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {email || displayName || "Account"}
            </p>
          </div>

          <div className="border-t border-gray-100" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700
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
