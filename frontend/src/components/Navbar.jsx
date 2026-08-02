import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint, Bell, ChevronDown, LogOut } from "lucide-react";

// Shared navbar for all authenticated pages — logo, notification bell, account menu
function Navbar() {
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

  // TEMPORARY — clears nothing real yet since JWT auth (PAW-18) isn't built.
  // Once real auth exists, this should clear the stored token and redirect.
  function handleLogout() {
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <div className="flex justify-between items-center px-5 py-3 relative">
      <Link to="/dashboard" className="flex items-center gap-2">
        <PawPrint size={20} className="text-white" />
        <span className="font-semibold text-sm text-white">PawBack</span>
      </Link>

      <div className="flex items-center gap-3">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full
                     hover:bg-white/10 text-white cursor-pointer transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full
                       border border-white/30 hover:bg-white/10
                       cursor-pointer transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-medium text-blue-800">
              D
            </div>
            <span className="text-sm text-white">Account</span>
            <ChevronDown size={14} className="text-blue-200" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-10">
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
      </div>
    </div>
  );
}

export default Navbar;