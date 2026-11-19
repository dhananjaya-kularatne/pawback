import { useId, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { clearSession } from "../utils/auth";
import { useSession } from "../utils/useSession";

// Account control shared by the authenticated Navbar and the landing-page
// header: the signed-in name in the bar, opening a menu with the account
// email and a Log out action. `onLoggedOut` lets the caller react after
// logout (e.g. the landing page flips its local auth state); when omitted
// it sends the user home.
export default function AccountMenu({ onLoggedOut }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();
  const navigate = useNavigate();
  const { user } = useSession();

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
  const displayName = user?.name || "";
  const email = user?.email || "";

  // Clears the JWT and user data, then hands control back to the caller
  function handleLogout() {
    clearSession();
    setMenuOpen(false);
    if (onLoggedOut) {
      onLoggedOut();
    } else {
      navigate("/");
    }
  }

  return (
    <div className="account-control" ref={menuRef} onKeyDown={(event) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setMenuOpen((open) => !open)}
        aria-controls={menuOpen ? panelId : undefined}
        aria-expanded={menuOpen}
        className="button-secondary button-small account-trigger"
      >
        <span className="min-w-0 max-w-xs whitespace-normal wrap-anywhere text-left">{displayName || "Account"}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-blue-700 transition-transform ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {menuOpen && (
        <div id={panelId} className="surface account-panel">
          <div className="px-3 py-2.5">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 wrap-anywhere">
              {email || displayName || "Account"}
            </p>
          </div>

          <div className="border-t border-gray-100" />

          <button
            onClick={handleLogout}
            className="button-quiet button-small w-full !justify-start"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
